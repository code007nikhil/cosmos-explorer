import type { GalleryItem } from "@/types";
import { cleanInline, htmlToText } from "@/lib/utils/text";

export const IMAGES_PAGE_SIZE = 24;
const MAX_PAGE = 20;

/** Returns null when valid, otherwise an error message. */
export function validateImageQuery(q: string, page: number): string | null {
  const t = q.trim();
  if (t.length < 2 || t.length > 100) return "Search text must be 2 to 100 characters.";
  if (!Number.isInteger(page) || page < 1 || page > MAX_PAGE) return `Page must be between 1 and ${MAX_PAGE}.`;
  return null;
}

export interface ImageSearchPage { items: GalleryItem[]; page: number; hasMore: boolean }

const isStr = (v: unknown): v is string => typeof v === "string" && v.length > 0;
const isNasaHttps = (v: unknown): v is string => {
  if (!isStr(v)) return false;
  try { const u = new URL(v); return u.protocol === "https:" && (u.hostname === "nasa.gov" || u.hostname.endsWith(".nasa.gov")); } catch { return false; }
};
const rec = (v: unknown): Record<string, unknown> | null => (v && typeof v === "object" ? (v as Record<string, unknown>) : null);

/** Validates the images-api.nasa.gov search response and maps it to gallery items. Returns null if unusable. */
export function parseImages(raw: unknown, page: number): ImageSearchPage | null {
  const collection = rec(rec(raw)?.collection);
  const list = collection?.items;
  if (!collection || !Array.isArray(list)) return null;
  const items: GalleryItem[] = [];
  for (const entry of list) {
    const e = rec(entry);
    const data = Array.isArray(e?.data) ? rec(e.data[0]) : null;
    if (!data || !isStr(data.nasa_id) || !isStr(data.title)) continue;
    if (isStr(data.media_type) && data.media_type !== "image") continue;
    const links = Array.isArray(e?.links) ? e.links : [];
    const preview = links.map(rec).find((l) => l?.rel === "preview" && isNasaHttps(l.href));
    const who = [data.secondary_creator, data.photographer, data.center].find(isStr);
    items.push({
      id: `nasa:${data.nasa_id}`,
      title: cleanInline(data.title),
      description: isStr(data.description) ? htmlToText(data.description).slice(0, 600) : "No description provided.",
      credit: `${who ? cleanInline(who) : "NASA"} (NASA Image and Video Library)`,
      imageUrl: preview ? (preview.href as string) : undefined,
      sourceUrl: `https://images.nasa.gov/details/${encodeURIComponent(data.nasa_id)}`,
    });
  }
  const total = rec(collection.metadata)?.total_hits;
  const hasMore = typeof total === "number" ? page * IMAGES_PAGE_SIZE < Math.min(total, 10000) : list.length >= IMAGES_PAGE_SIZE;
  return { items, page, hasMore };
}
