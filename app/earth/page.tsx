import { PageHeader } from "@/components/ui/states";
import { EarthViewer } from "@/components/earth/EarthViewer";
import { gibsMaxDate } from "@/lib/gibs";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata("Earth from Space", "Daily satellite imagery of Earth from NASA GIBS.", "/earth");
export const dynamic = "force-dynamic";
export default function Page() {
  return (<><PageHeader title="Earth from space" subtitle="Satellite imagery of our planet for any day since 2000, from NASA's Global Imagery Browse Services." /><EarthViewer maxDate={gibsMaxDate()} /></>);
}
