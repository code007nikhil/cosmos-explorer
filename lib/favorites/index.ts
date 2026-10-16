import type { FavoriteItem } from "@/types";
import { readJson, writeJson } from "@/lib/storage";
export const FAV_KEY = "cosmos:favorites:v1";
export function isFavoriteList(v: unknown): v is FavoriteItem[] {
  return Array.isArray(v) && v.every((i) => !!i && typeof i === "object" && typeof (i as FavoriteItem).id === "string" && typeof (i as FavoriteItem).title === "string" && typeof (i as FavoriteItem).href === "string" && ["planet", "gallery", "apod"].includes((i as FavoriteItem).type));
}
export const loadFavorites = () => readJson<FavoriteItem[]>(FAV_KEY, isFavoriteList, []);
export const saveFavorites = (items: FavoriteItem[]) => writeJson(FAV_KEY, items);
export function toggleFavorite(items: FavoriteItem[], item: Omit<FavoriteItem, "savedAt">, now = Date.now()): FavoriteItem[] {
  return items.some((i) => i.id === item.id) ? items.filter((i) => i.id !== item.id) : [...items, { ...item, savedAt: now }];
}
