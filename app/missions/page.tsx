import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/ui/states";
import { MISSIONS } from "@/lib/missions/data";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata("Missions", "Well-known space missions with links to authoritative NASA pages.", "/missions");
export default function Page() {
  return (
    <>
      <PageHeader title="Missions" subtitle="A curated list. Status text is not live; follow each link for current information." />
      <ul className="grid gap-4 md:grid-cols-2">
        {MISSIONS.map((m) => (
          <li key={m.id} className="surface space-y-2 p-5">
            <h2 className="text-xl font-semibold">{m.name}</h2>
            <p className="text-slate-300">{m.objective}</p>
            <p className="text-sm text-slate-400">Launch year: {m.launchYear} · Status: {m.status}</p>
            <a className="btn btn-ghost" href={m.url} target="_blank" rel="noreferrer noopener">Mission page <ExternalLink className="h-4 w-4" aria-hidden /></a>
          </li>
        ))}
      </ul>
    </>
  );
}
