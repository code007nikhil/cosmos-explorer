import { PageHeader } from "@/components/ui/states";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata("About", "About Cosmos Explorer and its data sources.", "/about");
export default function Page() {
  return (
    <>
      <PageHeader title="About Cosmos Explorer" subtitle="Your window into the universe." />
      <div className="max-w-2xl space-y-4 text-slate-300">
        <p>Cosmos Explorer is an independent educational project. It is not affiliated with or endorsed by NASA.</p>
        <p>Astronomy Picture of the Day comes from the <a className="underline" href="https://api.nasa.gov/" target="_blank" rel="noreferrer">NASA Open APIs</a>. When the API is unavailable, clearly labelled sample content is shown instead.</p>
        <p>Planet data comes from the <a className="underline" href="https://nssdc.gsfc.nasa.gov/planetary/factsheet/" target="_blank" rel="noreferrer">NASA Planetary Fact Sheet</a>. The 3D solar system uses an illustrative scale, and its orbital motion is a simple simulation, not an ephemeris.</p>
        <p>The <a className="underline" href="https://images.nasa.gov/" target="_blank" rel="noreferrer">NASA Image and Video Library</a> powers the gallery: searches return live results, shown with credits and links to the original sources. Mission entries are a curated static list, and each links to its NASA page.</p>
        <p>The Earth page shows satellite imagery from <a className="underline" href="https://earthdata.nasa.gov/gibs" target="_blank" rel="noreferrer">NASA GIBS</a> (Global Imagery Browse Services).</p>
      </div>
    </>
  );
}