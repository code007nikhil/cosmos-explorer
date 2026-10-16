import Link from "next/link";
import type { Planet } from "@/types";
import { PlanetOrb } from "./PlanetOrb";

export function PlanetCard({ planet }: { planet: Planet }) {
  return (
    <article className="surface flex flex-col gap-3 p-5">
      <div className="flex items-center gap-4"><PlanetOrb planet={planet} size={64} /><div><h3 className="text-xl font-semibold">{planet.name}</h3><p className="text-sm text-slate-400">{planet.type}</p></div></div>
      <p className="text-slate-300">{planet.summary}</p>
      <p className="text-sm text-cyan-200/90"><span className="font-semibold">Did you know?</span> {planet.fact}</p>
      <Link href={`/planet/${planet.slug}`} className="btn btn-ghost mt-auto self-start" aria-label={`Explore ${planet.name}`}>Explore {planet.name}</Link>
    </article>
  );
}
