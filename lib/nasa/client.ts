import "server-only";
import type { ApodData, ApodResult } from "@/types";
import { FALLBACK_APOD } from "./fallback";
import { parseApod, toLegacyCode, validateApodDate } from "./apod";
import { NasaError } from "./types";
import { IMAGES_PAGE_SIZE, parseImages, validateImageQuery, type ImageSearchPage } from "./images";

const TIMEOUT_MS = 8000;
const MAX_ATTEMPTS = 2; // one retry, only for network errors and 5xx
/** Server cache window in seconds. Edit to change how long APOD responses are reused. */
export const APOD_REVALIDATE = 3600;

async function fetchWithTimeout(url: string): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try { return await fetch(url, { signal: ctrl.signal, next: { revalidate: APOD_REVALIDATE } }); }
  finally { clearTimeout(t); }
}

export async function fetchApod(date?: string): Promise<ApodData> {
  if (date) { const err = validateApodDate(date); if (err) throw new NasaError(err, "invalid", 400); }
  // The legacy api.nasa.gov APOD endpoint is retired; ignore it if an old .env.local still points there.
  const configured = process.env.NASA_API_BASE_URL;
  const base = configured && !configured.includes("api.nasa.gov") ? configured.replace(/\/$/, "") : "https://science.nasa.gov";
  // Documented routes (NASA "APOD Feed And API User Guide"): /apod-basic/{YYMMDD} for one day, ?per_page=1 for the latest. No API key is used.
  const url = date ? `${base}/wp-json/wp/v2/apod-basic/${toLegacyCode(date)}` : `${base}/wp-json/wp/v2/apod-basic?per_page=1`;
  let last = new NasaError("Could not reach NASA.", "network");
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    let res: Response;
    try { res = await fetchWithTimeout(url); }
    catch { last = new NasaError("Could not reach NASA (network error or timeout).", "network"); continue; }
    if (res.status === 429) throw new NasaError("NASA rate limit reached. Try again later or add your own API key.", "rate_limit", 429);
    if (res.status === 404) throw new NasaError("NASA has no picture for that date yet.", "upstream", 404);
    if (res.status >= 500) { last = new NasaError("NASA returned a server error.", "upstream"); continue; }
    if (!res.ok) throw new NasaError("NASA could not provide that entry.", "upstream", res.status === 400 ? 400 : 502);
    let json: unknown;
    try { json = await res.json(); } catch { throw new NasaError("NASA returned an unreadable response.", "invalid"); }
    const data = parseApod(json);
    if (!data) throw new NasaError("NASA returned an unexpected response.", "invalid");
    return data;
  }
  throw last;
}

/** Never throws: falls back to clearly labelled bundled data. */
export async function getApodOrFallback(date?: string): Promise<ApodResult> {
  try { return { source: "live", data: await fetchApod(date) }; }
  catch (e) { return { source: "fallback", data: FALLBACK_APOD, notice: e instanceof NasaError ? e.message : "Live data is unavailable." }; }
}

/** Searches the NASA Image and Video Library (no API key required). */
export async function fetchImages(q: string, page = 1): Promise<ImageSearchPage> {
  const err = validateImageQuery(q, page);
  if (err) throw new NasaError(err, "invalid", 400);
  const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(q.trim())}&media_type=image&page=${page}&page_size=${IMAGES_PAGE_SIZE}`;
  let last = new NasaError("Could not reach the NASA Image Library.", "network");
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    let res: Response;
    try { res = await fetchWithTimeout(url); }
    catch { last = new NasaError("Could not reach the NASA Image Library (network error or timeout).", "network"); continue; }
    if (res.status === 429) throw new NasaError("The NASA Image Library rate limit was reached. Try again later.", "rate_limit", 429);
    if (res.status >= 500) { last = new NasaError("The NASA Image Library returned a server error.", "upstream"); continue; }
    if (!res.ok) throw new NasaError("The NASA Image Library could not run that search.", "upstream", res.status === 400 ? 400 : 502);
    let json: unknown;
    try { json = await res.json(); } catch { throw new NasaError("The NASA Image Library returned an unreadable response.", "invalid"); }
    const parsed = parseImages(json, page);
    if (!parsed) throw new NasaError("The NASA Image Library returned an unexpected response.", "invalid");
    return parsed;
  }
  throw last;
}
