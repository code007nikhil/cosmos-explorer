"use client";
import { Component, useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Pause, Play, RotateCcw, Eye, Tag, X } from "lucide-react";
import { PLANETS, getPlanet, PLANET_SOURCE } from "@/lib/planets/data";
import { formatNumber } from "@/lib/utils/format";
import { LoadingState, ErrorState } from "@/components/ui/states";

const Scene = dynamic(() => import("./Scene"), { ssr: false, loading: () => <LoadingState label="Loading 3D solar system…" /> });

class Boundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function Fallback({ reason }: { reason: string }) {
  return (
    <div className="space-y-4">
      <ErrorState title="3D view unavailable" message={`${reason} You can still explore every planet below.`} />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{PLANETS.map((p) => <li key={p.slug}><Link className="surface block p-4 hover:border-ion" href={`/planet/${p.slug}`}>{p.name}<span className="block text-sm text-slate-400">{p.type}</span></Link></li>)}</ul>
    </div>
  );
}

export function SolarSystem({ initial }: { initial?: string }) {
  const [webgl, setWebgl] = useState<"checking" | "yes" | "no">("checking");
  const [lost, setLost] = useState(false);
  const [selected, setSelected] = useState<string | null>(initial && getPlanet(initial) ? initial : null);
  const [paused, setPaused] = useState(false);
  const [orbits, setOrbits] = useState(true);
  const [labels, setLabels] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  useEffect(() => {
    try { const c = document.createElement("canvas"); setWebgl(c.getContext("webgl2") || c.getContext("webgl") ? "yes" : "no"); } catch { setWebgl("no"); }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPaused(true);
  }, []);
  if (webgl === "checking") return <LoadingState label="Checking graphics support…" />;
  if (webgl === "no") return <Fallback reason="Your browser does not support WebGL." />;
  if (lost) return <div className="space-y-4"><Fallback reason="The graphics context was lost." /><button className="btn btn-primary" onClick={() => { setLost(false); }}>Reload 3D view</button></div>;
  const p = selected ? getPlanet(selected) : undefined;
  const tools = [
    { label: paused ? "Resume animation" : "Pause animation", icon: paused ? Play : Pause, on: () => setPaused((v) => !v) },
    { label: orbits ? "Hide orbits" : "Show orbits", icon: Eye, on: () => setOrbits((v) => !v) },
    { label: labels ? "Hide labels" : "Show labels", icon: Tag, on: () => setLabels((v) => !v) },
    { label: "Reset camera", icon: RotateCcw, on: () => { setSelected(null); setResetKey((k) => k + 1); } },
  ];
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">{tools.map(({ label, icon: Icon, on }) => <button key={label} className="btn btn-ghost" onClick={on}><Icon className="h-4 w-4" aria-hidden />{label}</button>)}</div>
      <div className="relative h-[70vh] min-h-[420px] overflow-hidden rounded-2xl border border-slate-800 touch-none">
        <Boundary fallback={<Fallback reason="The 3D scene failed to load." />}>
          <Scene selected={selected} onSelect={setSelected} paused={paused} showOrbits={orbits} showLabels={labels} resetKey={resetKey} onContextLost={() => setLost(true)} />
        </Boundary>
        <p className={`pointer-events-none absolute bottom-2 left-3 z-10 rounded bg-black/50 px-2 py-1 text-xs text-slate-300 ${p ? "hidden sm:block" : ""}`}>Illustrative scale, not to scale. Orbital motion is simulated and not scientifically precise.</p>
        {p && (
          <aside aria-label={`${p.name} information`} className="surface absolute inset-x-3 bottom-3 z-30 max-h-[52%] overflow-y-auto bg-navy/95 p-4 text-sm sm:inset-x-auto sm:bottom-auto sm:right-3 sm:top-3 sm:max-h-[calc(100%-1.5rem)] sm:w-80">
            <div className="flex items-start justify-between"><div><h2 className="text-xl font-semibold">{p.name}</h2><p className="text-slate-400">{p.type}</p></div>
              <button aria-label="Close planet panel" onClick={() => { setSelected(null); setResetKey((k) => k + 1); }} className="rounded p-1 hover:bg-white/10"><X className="h-4 w-4" aria-hidden /></button></div>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              <dt className="text-slate-400">Mean radius</dt><dd>{formatNumber(p.radiusKm)} km</dd>
              <dt className="text-slate-400">From Sun</dt><dd>{formatNumber(p.distanceMillionKm)} million km</dd>
              <dt className="text-slate-400">Day</dt><dd>{p.dayLength}</dd>
              <dt className="text-slate-400">Year</dt><dd>{p.yearLength}</dd>
              <dt className="text-slate-400">Moons</dt><dd>{p.moons}</dd>
            </dl>
            <p className="mt-3 text-cyan-200/90">{p.fact}</p>
            <div className="mt-3 flex flex-wrap gap-2"><Link href={`/planet/${p.slug}`} className="btn btn-primary">Full details</Link><button className="btn btn-ghost" onClick={() => { setSelected(null); setResetKey((k) => k + 1); }}>Back to system</button></div>
            <a href={PLANET_SOURCE} className="mt-2 block text-xs text-slate-500 underline" target="_blank" rel="noreferrer">Source: NASA Planetary Fact Sheet</a>
          </aside>
        )}
      </div>
      <p className="mt-3 text-sm text-slate-400">Drag to rotate, scroll or pinch to zoom, click a planet to focus on it.</p>
    </div>
  );
}