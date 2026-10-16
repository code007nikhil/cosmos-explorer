"use client";
import { useCallback, useEffect, useState } from "react";
import type { FavoriteItem } from "@/types";
import { loadFavorites, saveFavorites, toggleFavorite } from "./index";

const EVT = "cosmos:favorites-changed";
export function useFavorites() {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sync = () => { setItems(loadFavorites()); setReady(true); };
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(EVT, sync); window.removeEventListener("storage", sync); };
  }, []);
  const toggle = useCallback((item: Omit<FavoriteItem, "savedAt">) => {
    saveFavorites(toggleFavorite(loadFavorites(), item));
    window.dispatchEvent(new Event(EVT));
  }, []);
  return { items, ready, toggle, has: (id: string) => items.some((i) => i.id === id) };
}
