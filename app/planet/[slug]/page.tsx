import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PLANETS, getPlanet, PLANET_SOURCE } from "@/lib/planets/data";
import { formatNumber } from "@/lib/utils/format";
import { PlanetOrb } from "@/components/planets/PlanetOrb";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { pageMetadata } from "@/lib/metadata";

export const dynamicParams = false;
export const generateStaticParams = () => PLANETS.map((p) => ({ slug: p.slug }));
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getPlanet((await params).slug);
  return p ? pageMetadata(p.name, p.summary, `/planet/${p.slug}`) : {};
}

export default async function PlanetPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getPlanet((await params).slug);
  if (!p) notFound();
  const facts: [string, string][] = [
    ["Type", p.type], ["Mean radius", `${formatNumber(p.radiusKm)} km`], ["Mean distance from Sun", `${formatNumber(p.distanceMillionKm)} million km`],
    ["Length of day", p.dayLength], ["Length of year", p.yearLength], ["Moons", p.moons],
  ];
  const related = PLANETS.filter((x) => x.type === p.type && x.slug !== p.slug);
  return (
    <div className="space-y-8">
      <section className="surface flex flex-col items-center gap-8 p-8 md:flex-row">
        <PlanetOrb planet={p} size={200} />
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold">{p.name}</h1>
          <p className="max-w-xl text-lg text-slate-300">{p.summary}</p>
          <div className="flex flex-wrap gap-2"><Link href={`/solar-system?planet=${p.slug}`} className="btn btn-primary">View in Solar System</Link><FavoriteButton item={{ id: `planet:${p.slug}`, type: "planet", title: p.name, href: `/planet/${p.slug}` }} /></div>
        </div>
      </section>
      <section aria-labelledby="facts"><h2 id="facts" className="mb-3 text-2xl font-semibold">Key facts</h2>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{facts.map(([k, v]) => <div key={k} className="surface p-4"><dt className="text-sm text-slate-400">{k}</dt><dd className="mt-1">{v}</dd></div>)}</dl></section>
      <section className="grid gap-4 md:grid-cols-3">
        {[["Composition", p.composition], ["Atmosphere", p.atmosphere], ["Temperature", p.temperature]].map(([k, v]) => <div key={k} className="surface p-5"><h2 className="font-semibold">{k}</h2><p className="mt-1 text-slate-300">{v}</p></div>)}
      </section>
      <section className="surface p-5"><h2 className="font-semibold">Interesting fact</h2><p className="mt-1 text-cyan-200/90">{p.fact}</p></section>
      {related.length > 0 && <section><h2 className="mb-3 text-2xl font-semibold">Related planets</h2><div className="flex flex-wrap gap-2">{related.map((r) => <Link key={r.slug} href={`/planet/${r.slug}`} className="btn btn-ghost">{r.name}</Link>)}</div></section>}
      <p className="text-sm text-slate-500">Values from the <a className="underline" href={PLANET_SOURCE} target="_blank" rel="noreferrer">NASA Planetary Fact Sheet</a>. Temperatures are surface means for rocky planets and 1 bar level values for giants. Moon counts change as new moons are confirmed.</p>
      <Link href="/solar-system" className="btn btn-ghost">Back to the solar system</Link>
    </div>
  );
}
