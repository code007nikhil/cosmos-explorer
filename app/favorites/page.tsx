import { PageHeader } from "@/components/ui/states";
import { FavoritesList } from "@/components/favorites/FavoritesList";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata("Favorites", "Your saved planets, images and pictures of the day.", "/favorites");
export default function Page() {
  return (<><PageHeader title="Favorites" subtitle="Saved in this browser only. They do not sync between devices." /><FavoritesList /></>);
}
