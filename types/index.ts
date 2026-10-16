export interface Planet {
  slug: string; name: string; type: string;
  radiusKm: number; distanceMillionKm: number;
  dayLength: string; yearLength: string; moons: string;
  summary: string; fact: string; composition: string; atmosphere: string; temperature: string;
  colors: [string, string];
  rings?: boolean;
  vis: { radius: number; orbit: number; speed: number };
}
export interface Mission { id: string; name: string; objective: string; launchYear: number; status: string; url: string }
export interface GalleryItem { id: string; title: string; category?: GalleryCategory; description: string; credit: string; imageUrl?: string; sourceUrl: string }
export type GalleryCategory = "galaxies" | "nebulae" | "planets" | "stars" | "missions";
export interface ApodData { date: string; title: string; explanation: string; mediaType: "image" | "video" | "other"; pageUrl: string; imageUrl?: string; alt?: string; copyright?: string; credit?: string }
export interface ApodResult { source: "live" | "fallback"; data: ApodData; notice?: string }
export interface FavoriteItem { id: string; type: "planet" | "gallery" | "apod"; title: string; href: string; savedAt: number }
export interface SearchResult { id: string; kind: "planet" | "mission" | "gallery"; title: string; description: string; href: string }
