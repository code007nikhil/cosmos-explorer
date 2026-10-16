"use client";
import { useMemo, useState } from "react";
import { ExternalLink, Search, X } from "lucide-react";
import { GALLERY } from "@/lib/gallery/data";
import type { ImageSearchPage } from "@/lib/nasa/images";
import type { GalleryItem } from "@/types";
import { RemoteImage } from "@/components/ui/RemoteImage";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";

interface Live { query: string; items: GalleryItem[]; page: number; hasMore: boolean }

const CATEGORY_QUERIES: Record<string, string> = { all: "space", galaxies: "galaxy", nebulae: "nebula", planets: "planet", stars: "star", missions: "space mission" };

export function GalleryClient({ initial, initialQuery, fromUrl }: { initial: ImageSearchPage | null; initialQuery: string; fromUrl: boolean }) {
  const [q, setQ] = useState(fromUrl ? initialQuery : "");
  const [cat, setCat] = useState<string>(fromUrl ? "" : "all");
  const [open, setOpen] = useState<GalleryItem | null>(null);
  const [live, setLive] = useState<Live | null>(initial ? { query: initialQuery, items: initial.items, page: initial.page, hasMore: initial.hasMore } : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const curated = useMemo(() => {
    const s = q.trim().toLowerCase();
    return GALLERY.filter((g) => !s || g.title.toLowerCase().includes(s) || g.description.toLowerCase().includes(s));
  }, [q]);

  async function searchLive(query: string, page = 1) {
    if (page === 1) setCat(Object.entries(CATEGORY_QUERIES).find(([, v]) => v === query.trim())?.[0] ?? "");
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/nasa/images?q=${encodeURIComponent(query.trim())}&page=${page}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Search failed.");
      setLive((prev) => ({ query: query.trim(), page: json.page, hasMore: json.hasMore, items: page > 1 && prev ? [...prev.items, ...(json.items as GalleryItem[]).filter((n) => !prev.items.some((o) => o.id === n.id))] : json.items }));
    } catch (e) { setError(e instanceof Error ? e.message : "Search failed."); }
    finally { setLoading(false); }
  }

  const items = live ? live.items : curated;
  return (
    <div className="space-y-5">
      <form className="flex flex-wrap items-center gap-3" onSubmit={(e) => { e.preventDefault(); if (q.trim().length >= 2) searchLive(q); }}>
        <label htmlFor="g-search" className="sr-only">Search gallery</label>
        <input id="g-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search images" className="w-full max-w-xs rounded-lg border border-slate-600 bg-navy px-3 py-2 placeholder:text-slate-500" />
        <button type="submit" className="btn btn-primary" disabled={loading || q.trim().length < 2}><Search className="h-4 w-4" aria-hidden />Search</button>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Browse by category">
          {Object.keys(CATEGORY_QUERIES).map((c) => <button type="button" key={c} aria-pressed={cat === c} disabled={loading} onClick={() => { setQ(""); searchLive(CATEGORY_QUERIES[c]); }} className={`btn capitalize ${cat === c ? "btn-primary" : "btn-ghost"}`}>{c}</button>)}
        </div>
      </form>
      {live ? (
        <p role="status" className="text-sm text-slate-400">Live results for “{live.query}” from the NASA Image and Video Library.</p>
      ) : (
        <p role="status" className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">Live NASA results are unavailable right now, so this is a curated selection. <button className="underline" onClick={() => searchLive(q.trim().length >= 2 ? q : "space")}>Try live search again</button></p>
      )}
      {error && <ErrorState title="Couldn't search the NASA library" message={error} onRetry={() => searchLive(live?.query ?? q)} />}
      {items.length === 0 && !loading ? (
        <EmptyState title="No images match" message="Try a different keyword or choose another category."><button className="btn btn-ghost mt-2" onClick={() => { setQ(""); searchLive("space"); }}>Show all space images</button></EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((g) => (
            <li key={g.id} className="surface overflow-hidden">
              <button className="block w-full text-left" onClick={() => setOpen(g)} aria-label={`Open ${g.title}`}>
                <RemoteImage src={g.imageUrl} alt={g.title} className="h-48 w-full" />
                <span className="block p-4"><span className="line-clamp-2 block font-semibold">{g.title}</span>{g.category && <span className="text-sm capitalize text-slate-400">{g.category}</span>}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {loading && <LoadingState label="Searching the NASA library…" />}
      {live?.hasMore && !loading && <button className="btn btn-ghost" onClick={() => searchLive(live.query, live.page + 1)}>Load more</button>}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4" onKeyDown={(e) => e.key === "Escape" && setOpen(null)} onMouseDown={(e) => e.target === e.currentTarget && setOpen(null)}>
          <div role="dialog" aria-modal="true" aria-label={open.title} className="surface max-h-full w-full max-w-2xl overflow-y-auto bg-navy">
            <div className="flex justify-end p-2"><button autoFocus aria-label="Close image" onClick={() => setOpen(null)} className="rounded p-1 hover:bg-white/10"><X className="h-5 w-5" aria-hidden /></button></div>
            <RemoteImage src={open.imageUrl} alt={open.title} className="max-h-[50vh] w-full" />
            <div className="space-y-3 p-5"><h2 className="text-2xl font-semibold">{open.title}</h2><p className="whitespace-pre-line text-slate-300">{open.description}</p><p className="text-sm text-slate-400">Credit: {open.credit}</p>
              <div className="flex flex-wrap gap-2"><FavoriteButton item={{ id: `gallery:${open.id}`, type: "gallery", title: open.title, href: `/gallery?q=${encodeURIComponent(open.title)}` }} />
                <a className="btn btn-ghost" href={open.sourceUrl} target="_blank" rel="noreferrer noopener">View source <ExternalLink className="h-4 w-4" aria-hidden /></a></div></div>
          </div>
        </div>
      )}
    </div>
  );
}
