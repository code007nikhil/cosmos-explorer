import type { SearchResult } from "@/types";
import { PLANETS } from "@/lib/planets/data";
import { MISSIONS } from "@/lib/missions/data";
import { GALLERY } from "@/lib/gallery/data";

/** Search abstraction: swap this provider to use a remote astronomy database later without changing the UI. */
export interface SearchProvider { search(query: string, limit?: number): SearchResult[] }

export const LOCAL_INDEX: SearchResult[] = [
  ...PLANETS.map((p): SearchResult => ({ id: `planet:${p.slug}`, kind: "planet", title: p.name, description: p.summary, href: `/planet/${p.slug}` })),
  ...MISSIONS.map((m): SearchResult => ({ id: `mission:${m.id}`, kind: "mission", title: m.name, description: m.objective, href: "/missions" })),
  ...GALLERY.map((g): SearchResult => ({ id: `gallery:${g.id}`, kind: "gallery", title: g.title, description: g.description, href: `/gallery?q=${encodeURIComponent(g.title)}` })),
];

export function searchIndex(index: SearchResult[], query: string, limit = 8): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return index
    .map((r) => { const t = r.title.toLowerCase(); return { r, score: t === q ? 4 : t.startsWith(q) ? 3 : t.includes(q) ? 2 : r.description.toLowerCase().includes(q) ? 1 : 0 }; })
    .filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, limit).map((s) => s.r);
}
export const localSearch: SearchProvider = { search: (q, l) => searchIndex(LOCAL_INDEX, q, l) };
