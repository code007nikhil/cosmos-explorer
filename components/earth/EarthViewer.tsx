"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { GIBS_LAYERS, GIBS_MIN_DATE, GIBS_REGIONS, buildGibsUrl } from "@/lib/gibs";
import { shiftDate } from "@/lib/nasa/apod";
import { formatDate } from "@/lib/utils/format";
import { ErrorState, LoadingState } from "@/components/ui/states";

export function EarthViewer({ maxDate }: { maxDate: string }) {
  const [layerId, setLayerId] = useState(GIBS_LAYERS[0].id);
  const [regionId, setRegionId] = useState(GIBS_REGIONS[0].id);
  const [date, setDate] = useState(maxDate);
  const [coastlines, setCoastlines] = useState(true);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const built = useMemo(() => buildGibsUrl({ layerId, regionId, date, coastlines }, maxDate), [layerId, regionId, date, coastlines, maxDate]);
  const img = useRef<HTMLImageElement>(null);
  // Load/error events that fire before hydration are missed, so sync the status from the element itself.
  useEffect(() => { const el = img.current; if (el?.complete) setStatus(el.naturalWidth > 0 ? "ready" : "error"); }, [built, attempt]);
  const layer = GIBS_LAYERS.find((l) => l.id === layerId)!;
  const change = (fn: () => void) => { fn(); setStatus("loading"); };
  const field = "rounded-lg border border-slate-600 bg-navy px-3 py-2";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm text-slate-400">Imagery<select className={`${field} mt-1 block`} value={layerId} onChange={(e) => change(() => setLayerId(e.target.value))}>{GIBS_LAYERS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}</select></label>
        <label className="text-sm text-slate-400">Region<select className={`${field} mt-1 block`} value={regionId} onChange={(e) => change(() => setRegionId(e.target.value))}>{GIBS_REGIONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}</select></label>
        <div className="flex items-end gap-2">
          <button className="btn btn-ghost" aria-label="Previous day" disabled={date <= GIBS_MIN_DATE} onClick={() => change(() => setDate(shiftDate(date, -1)))}><ChevronLeft className="h-4 w-4" aria-hidden />Previous</button>
          <label className="text-sm text-slate-400">Date<input type="date" className={`${field} mt-1 block`} min={GIBS_MIN_DATE} max={maxDate} value={date} onChange={(e) => e.target.value && change(() => setDate(e.target.value))} /></label>
          <button className="btn btn-ghost" aria-label="Next day" disabled={date >= maxDate} onClick={() => change(() => setDate(shiftDate(date, 1)))}>Next<ChevronRight className="h-4 w-4" aria-hidden /></button>
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm text-slate-300"><input type="checkbox" checked={coastlines} onChange={(e) => change(() => setCoastlines(e.target.checked))} />Coastlines</label>
      </div>
      <p className="text-sm text-slate-400">{layer.description} Showing {formatDate(date)}. Some layers have gaps for days or places with no data.</p>
      {!built.ok ? <ErrorState title="Can't show this view" message={built.error} /> : (
        <div className="surface relative overflow-hidden bg-black">
          {status === "loading" && <div className="absolute inset-0 z-10 grid place-items-center bg-black/60"><LoadingState label="Loading satellite imagery…" /></div>}
          {status === "error" ? (
            <div className="p-4"><ErrorState title="Imagery didn't load" message="NASA GIBS didn't return an image. The date may not have data for this layer, or the service may be busy." onRetry={() => { setStatus("loading"); setAttempt((a) => a + 1); }} /></div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img ref={img} key={`${built.url}-${attempt}`} src={built.url} alt={`${layer.label} for ${formatDate(date)}, region ${GIBS_REGIONS.find((r) => r.id === regionId)?.label}`} width={built.width} height={built.height}
              onLoad={() => setStatus("ready")} onError={() => setStatus("error")} className="mx-auto max-h-[75vh] w-auto max-w-full object-contain" referrerPolicy="no-referrer" />
          )}
        </div>
      )}
      <p className="text-sm text-slate-500">Imagery: NASA Global Imagery Browse Services (GIBS), shown via the public WMS service.{" "}
        <a className="underline" href="https://worldview.earthdata.nasa.gov/" target="_blank" rel="noreferrer noopener">Explore more in NASA Worldview <ExternalLink className="inline h-3 w-3" aria-hidden /></a></p>
    </div>
  );
}
