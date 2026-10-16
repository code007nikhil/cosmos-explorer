"use client";
import { useCallback, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import type { ApodResult } from "@/types";
import { shiftDate, validateApodDate, APOD_START } from "@/lib/nasa/apod";
import { formatDate } from "@/lib/utils/format";
import { RemoteImage } from "@/components/ui/RemoteImage";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { ErrorState, LoadingState } from "@/components/ui/states";

export function ApodViewer({ initial, today }: { initial: ApodResult; today: string }) {
  const [result, setResult] = useState<ApodResult>(initial);
  const [date, setDate] = useState(initial.source === "live" ? initial.data.date : today);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (d: string) => {
    const invalid = validateApodDate(d, today);
    if (invalid) { setError(invalid); return; }
    setDate(d); setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/nasa/apod?date=${d}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed.");
      setResult(json as ApodResult);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load this entry."); }
    finally { setLoading(false); }
  }, [today]);

  const d = result.data;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn btn-ghost" onClick={() => load(shiftDate(date, -1))} disabled={date <= APOD_START || loading} aria-label="Previous day"><ChevronLeft className="h-4 w-4" aria-hidden />Previous</button>
        <label className="sr-only" htmlFor="apod-date">Choose a date</label>
        <input id="apod-date" type="date" min={APOD_START} max={today} value={date} onChange={(e) => e.target.value && load(e.target.value)} className="rounded-lg border border-slate-600 bg-navy px-3 py-2" />
        <button className="btn btn-ghost" onClick={() => load(shiftDate(date, 1))} disabled={date >= today || loading} aria-label="Next day">Next<ChevronRight className="h-4 w-4" aria-hidden /></button>
        <button className="btn btn-ghost" onClick={() => load(today)} disabled={loading}>Today</button>
      </div>
      {error && <ErrorState title="Couldn't load this picture" message={error} onRetry={() => load(date)} />}
      {loading ? <LoadingState label="Loading picture…" /> : (
        <article className="surface overflow-hidden">
          {result.source === "fallback" && <p role="status" className="border-b border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">Sample content: {result.notice ?? "live NASA data is unavailable."} This is bundled placeholder text, not a live NASA response.</p>}
          {d.mediaType === "image" && d.imageUrl ? <RemoteImage src={d.imageUrl} alt={d.alt || d.title} className="max-h-[70vh] w-full" />
            : <div className="grid place-items-center bg-navy p-10 text-center"><p className="mb-3">{d.mediaType === "video" ? "Today's entry is a video." : "No image is available for this entry."}</p><a className="btn btn-primary" href={d.pageUrl} target="_blank" rel="noreferrer noopener">Open on NASA <ExternalLink className="h-4 w-4" aria-hidden /></a></div>}
          <div className="space-y-3 p-5">
            <h2 className="text-2xl font-semibold">{d.title}</h2>
            <p className="text-sm text-slate-400">{result.source === "live" ? formatDate(d.date) : "Sample entry"} · Media: {d.mediaType}</p>
            <p className="max-w-3xl whitespace-pre-line leading-relaxed text-slate-300">{d.explanation}</p>
            <p className="text-sm text-slate-400">{d.credit ? `Image credit: ${d.credit}. ` : ""}{d.copyright ? (d.copyright !== d.credit ? `Copyright: ${d.copyright}.` : "") : d.credit ? "" : "No copyright holder listed; check the source page."} Data provided by the NASA APOD API.</p>
            <div className="flex flex-wrap gap-2">
              {result.source === "live" && <FavoriteButton item={{ id: `apod:${d.date}`, type: "apod", title: d.title, href: `/apod?date=${d.date}` }} />}
              {d.imageUrl && <a className="btn btn-ghost" href={d.imageUrl} target="_blank" rel="noreferrer noopener">Full resolution <ExternalLink className="h-4 w-4" aria-hidden /></a>}
              <a className="btn btn-ghost" href={d.pageUrl} target="_blank" rel="noreferrer noopener">NASA page <ExternalLink className="h-4 w-4" aria-hidden /></a>
            </div>
          </div>
        </article>
      )}
    </div>
  );
}
