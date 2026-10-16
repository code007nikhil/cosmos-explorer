import { PageHeader } from "@/components/ui/states";
import { SolarSystem } from "@/components/solar-system/SolarSystem";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata("Interactive Solar System", "Explore the Sun and eight planets in an interactive 3D scene.", "/solar-system");
export default async function Page({ searchParams }: { searchParams: Promise<{ planet?: string }> }) {
  const { planet } = await searchParams;
  return (<><PageHeader title="Solar System" subtitle="Select a planet to focus on it and see its facts." /><SolarSystem initial={planet} /></>);
}
