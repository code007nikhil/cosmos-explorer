import type { ApodData } from "@/types";
import { cleanExplanation, cleanInline, htmlToText } from "@/lib/utils/text";

export const APOD_START = "1995-06-16";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const todayUtc = () => new Date().toISOString().slice(0, 10);
/** APOD publishes at 00:05 US Eastern, so "today" for APOD is the Eastern calendar date (not UTC). */
export const apodToday = (now = new Date()) => now.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
/** NASA's APOD endpoint addresses single days by legacy YYMMDD code, e.g. 2014-09-18 -> "140918". */
export const toLegacyCode = (date: string) => date.slice(2).replace(/-/g, "");

/** Returns null when valid, otherwise an error message. */
export function validateApodDate(date: string, today = apodToday()): string | null {
  if (!DATE_RE.test(date)) return "Date must use the format YYYY-MM-DD.";
  const d = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== date) return "That is not a real calendar date.";
  if (date < APOD_START) return `APOD starts on ${APOD_START}.`;
  if (date > today) return "Future dates are not available.";
  return null;
}

export function shiftDate(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const isStr = (v: unknown): v is string => typeof v === "string" && v.length > 0;
const isHttp = (v: string) => { try { const p = new URL(v).protocol; return p === "https:" || p === "http:"; } catch { return false; } };

/** Validates and normalises an unknown upstream payload (new WordPress-based APOD API). Returns null if unusable. */
export function parseApod(input: unknown): ApodData | null {
  const raw = Array.isArray(input) ? input[0] : input;
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (!isStr(r.date) || !isStr(r.title) || !isStr(r.explanation) || !isStr(r.url) || !isHttp(r.url)) return null;
  if (!cleanExplanation(r.explanation)) return null;
  const mediaType = r.media_type === "image" ? "image" : r.media_type === "video" ? "video" : "other";
  const clean = (v: unknown) => (isStr(v) ? cleanInline(v) || undefined : undefined);
  return {
    date: r.date, title: htmlToText(r.title), explanation: cleanExplanation(r.explanation), mediaType, pageUrl: r.url,
    imageUrl: mediaType === "image" && isStr(r.hdurl) && isHttp(r.hdurl) ? r.hdurl : undefined,
    alt: clean(r.alt), copyright: clean(r.copyright)?.replace(/^image credit\s*&\s*copyright:\s*|^copyright:\s*/i, ""), credit: clean(r.credit)?.replace(/^image credit(\s*&\s*copyright)?:\s*|^credit:\s*/i, ""),
  };
}
