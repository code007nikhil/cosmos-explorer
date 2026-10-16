import { PageHeader } from "@/components/ui/states";
import { ApodViewer } from "@/components/apod/ApodViewer";
import { getApodOrFallback } from "@/lib/nasa/client";
import { apodToday, validateApodDate } from "@/lib/nasa/apod";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata("Astronomy Picture of the Day", "NASA's Astronomy Picture of the Day with date browsing.", "/apod");
export default async function Page({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const { date } = await searchParams;
  const valid = date && !validateApodDate(date) ? date : undefined;
  const initial = await getApodOrFallback(valid);
  return (<><PageHeader title="Astronomy Picture of the Day" subtitle="A new space image every day, with an explanation from NASA." /><ApodViewer initial={initial} today={apodToday()} /></>);
}
