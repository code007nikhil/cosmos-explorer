import { PageHeader } from "@/components/ui/states";
import { GalleryClient } from "@/components/gallery/GalleryClient";
import { fetchImages } from "@/lib/nasa/client";
import type { ImageSearchPage } from "@/lib/nasa/images";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Space Gallery", "Live space imagery from the NASA Image and Video Library.", "/gallery");

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q && q.trim().length >= 2 ? q.trim().slice(0, 100) : "space";
  let initial: ImageSearchPage | null = null;
  try { initial = await fetchImages(query); } catch { initial = null; }
  return (
    <>
      <PageHeader title="Space gallery" subtitle="Images from the NASA Image and Video Library, with credits and links to the original sources." />
      <GalleryClient initial={initial} initialQuery={query} fromUrl={Boolean(q)} />
    </>
  );
}
