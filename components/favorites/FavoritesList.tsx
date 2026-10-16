"use client";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useFavorites } from "@/lib/favorites/useFavorites";
import { EmptyState, LoadingState } from "@/components/ui/states";

export function FavoritesList() {
  const { items, ready, toggle } = useFavorites();
  if (!ready) return <LoadingState />;
  if (items.length === 0) return <EmptyState title="Nothing saved yet" message="Save planets, gallery images and pictures of the day to see them here."><Link href="/solar-system" className="btn btn-primary mt-3">Explore the solar system</Link></EmptyState>;
  return (
    <ul className="space-y-3">
      {items.map((i) => (
        <li key={i.id} className="surface flex items-center justify-between gap-3 p-4">
          <Link href={i.href} className="min-w-0"><span className="block truncate font-semibold">{i.title}</span><span className="text-sm capitalize text-slate-400">{i.type}</span></Link>
          <button className="btn btn-ghost" aria-label={`Remove ${i.title} from favorites`} onClick={() => toggle({ id: i.id, type: i.type, title: i.title, href: i.href })}><Trash2 className="h-4 w-4" aria-hidden />Remove</button>
        </li>
      ))}
    </ul>
  );
}
