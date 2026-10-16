import Link from "next/link";
import { fetchImages, getApodOrFallback } from "@/lib/nasa/client";
import type { GalleryItem } from "@/types";
import { PLANETS } from "@/lib/planets/data";
import { GALLERY } from "@/lib/gallery/data";
import { formatDate } from "@/lib/utils/format";
import { PlanetCard } from "@/components/planets/PlanetCard";
import { PlanetOrb } from "@/components/planets/PlanetOrb";
import { RemoteImage } from "@/components/ui/RemoteImage";

export const revalidate = 600;

export default async function HomePage() {
  const apod = await getApodOrFallback();
  let featuredImages: GalleryItem[] = [];
  try { featuredImages = (await fetchImages("galaxy nebula")).items.filter((g) => g.imageUrl).slice(0, 3); } catch { /* fall back to curated list */ }
  if (featuredImages.length === 0) featuredImages = GALLERY.filter((g) => g.imageUrl).slice(0, 3);
  const d = apod.data;
  const featured = PLANETS[5];
  return (
    <div className="space-y-16">
      <section className="stars relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-navy to-void px-6 py-16 sm:px-12 sm:py-24">
        <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h1 className="text-4xl font-semibold sm:text-6xl">Explore the Universe</h1>
            <p className="mt-4 max-w-xl text-lg text-slate-300">Discover planets, galaxies, and the science beyond our world.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/solar-system" className="btn btn-primary">Explore Solar System</Link>
              <Link href="/apod" className="btn btn-ghost">Discover Today&apos;s Space Image</Link>
            </div>
          </div>
          <Link href={`/planet/${featured.slug}`} className="surface flex items-center gap-4 p-5 hover:border-ion">
            <PlanetOrb planet={featured} size={88} />
            <span><span className="block text-sm text-slate-400">Featured planet</span><span className="block text-xl font-semibold">{featured.name}</span><span className="text-sm text-slate-300">{featured.fact}</span></span>
          </Link>
        </div>
      </section>

      <section aria-labelledby="daily">
        <h2 id="daily" className="mb-4 text-2xl font-semibold">{apod.source === "live" ? "Astronomy Picture of the Day" : "Daily discovery (sample)"}</h2>
        {apod.source === "fallback" && <p role="status" className="mb-3 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">Live NASA data is unavailable, so this is bundled sample content. {apod.notice}</p>}
        <div className="surface grid overflow-hidden md:grid-cols-2">
          {d.mediaType === "image" && d.imageUrl ? <RemoteImage src={d.imageUrl} alt={d.alt || d.title} className="h-72 w-full md:h-full" /> : <div className="grid min-h-48 place-items-center bg-navy p-6 text-slate-400">{d.mediaType === "video" ? "Today's entry is a video" : "No image available"}</div>}
          <div className="space-y-3 p-6">
            <h3 className="text-2xl font-semibold">{d.title}</h3>
            {apod.source === "live" && <p className="text-sm text-slate-400">{formatDate(d.date)}</p>}
            <p className="line-clamp-5 text-slate-300">{d.explanation}</p>
            {(d.credit || d.copyright) && <p className="text-sm text-slate-400">Credit: {d.credit || d.copyright}</p>}
            <Link href={apod.source === "live" ? `/apod?date=${d.date}` : "/apod"} className="btn btn-primary">Open full discovery</Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="planets">
        <h2 id="planets" className="mb-4 text-2xl font-semibold">The eight planets</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{PLANETS.map((p) => <PlanetCard key={p.slug} planet={p} />)}</div>
      </section>

      <section aria-labelledby="quick" className="grid gap-4 md:grid-cols-3">
        <h2 id="quick" className="sr-only">Quick facts</h2>
        {[["Eight planets", "Four rocky worlds, two gas giants and two ice giants orbit the Sun."], ["Light from the Sun", "Takes about 8 minutes to reach Earth."], ["Jupiter", "Has more than twice the mass of all the other planets combined."]].map(([t, b]) => <div key={t} className="surface p-5"><h3 className="font-semibold">{t}</h3><p className="mt-1 text-slate-300">{b}</p></div>)}
      </section>

      <section aria-labelledby="feat">
        <div className="mb-4 flex items-end justify-between"><h2 id="feat" className="text-2xl font-semibold">Featured space imagery</h2><Link href="/gallery" className="btn btn-ghost">Open the gallery</Link></div>
        <ul className="grid gap-4 sm:grid-cols-3">{featuredImages.map((g) => <li key={g.id} className="surface overflow-hidden"><RemoteImage src={g.imageUrl} alt={g.title} className="h-40 w-full" /><p className="p-4 font-semibold">{g.title}</p></li>)}</ul>
      </section>
      <p className="text-sm text-slate-500">Planet visuals on this site are artistic illustrations and are not to scale.</p>
    </div>
  );
}
