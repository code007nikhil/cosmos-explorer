import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { PLANETS } from "@/lib/planets/data";
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/solar-system", "/apod", "/earth", "/gallery", "/missions", "/favorites", "/about", ...PLANETS.map((p) => `/planet/${p.slug}`)];
  return paths.map((p) => ({ url: `${SITE.url}${p}` }));
}
