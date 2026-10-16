"use client";
import { Heart } from "lucide-react";
import type { FavoriteItem } from "@/types";
import { useFavorites } from "@/lib/favorites/useFavorites";

export function FavoriteButton({ item, label = true }: { item: Omit<FavoriteItem, "savedAt">; label?: boolean }) {
  const { has, toggle, ready } = useFavorites();
  const on = ready && has(item.id);
  return (
    <button type="button" className="btn btn-ghost" aria-pressed={on} aria-label={on ? `Remove ${item.title} from favorites` : `Save ${item.title} to favorites`} onClick={() => toggle(item)}>
      <Heart className={`h-4 w-4 ${on ? "fill-rose-400 text-rose-400" : ""}`} aria-hidden />{label && (on ? "Saved" : "Save")}
    </button>
  );
}
