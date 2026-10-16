# Architecture
- `app/`: routes (server components by default; client components only where interaction needs them). API routes: `app/api/nasa/apod` (APOD) and `app/api/nasa/images` (gallery search). Both validate input and set cache headers.
- `components/`: UI by area. 3D code lives only in `components/solar-system/` and is lazy-loaded (`next/dynamic`, `ssr: false`). `components/earth/` holds the Earth imagery viewer and `components/gallery/` the gallery UI.
- `lib/nasa/`: the only code that talks to NASA's APIs (`client.ts` is server-only). `apod.ts` handles APOD and date helpers, `images.ts` validates gallery queries and parses responses from the NASA Image and Video Library, and `fallback.ts` holds the sample content shown when NASA is unavailable.
- `lib/gibs/`: builds NASA GIBS WMS image URLs from a fixed set of layers, regions and a validated date. Used client-side by the Earth viewer, so no API key is needed.
- `lib/planets|missions|gallery/`: typed static data. `lib/gallery/data.ts` is a small curated manifest that is still bundled; the main gallery experience is live search.
- `lib/search/`: `SearchProvider` interface. `lib/favorites` + `lib/storage`: defensive localStorage.
- `types/`, `tests/` (Vitest: images, app, nasa-client, gibs).

## Data flow
- **Gallery:** `GalleryClient` calls `/api/nasa/images?q=&page=` -> `fetchImages` queries `images-api.nasa.gov` -> `parseImages` keeps only image results with HTTPS `*.nasa.gov` previews and maps them to `GalleryItem`. Query length (2 to 100) and page (1 to 20) are validated; responses are cached for an hour.
- **Earth:** `EarthViewer` builds a GIBS URL with `buildGibsUrl` (layer, region, date, optional coastlines) and loads it directly as an image. Dates are clamped between `GIBS_MIN_DATE` and the latest available day.
- **APOD:** `/api/nasa/apod?date=` -> `fetchApod`; on failure the UI shows labelled sample content.

## Extension points (not built in the MVP)
1. Mission tracking: add `lib/missions/live.ts` behind the existing mission shape.
2-4. More NASA APIs, near-Earth objects: add a module beside `lib/nasa/apod.ts` and a route under `app/api/nasa/<n>/`. More Earth layers: extend `GIBS_LAYERS` in `lib/gibs`.
5. Exoplanets: new data module and page; register in `lib/search`.
6, 8. Satellites, spacecraft models: new components in `components/solar-system/`.
7. Accurate orbits: replace the angle update in `PlanetBody` (`Scene.tsx`) with an ephemeris module.
9-11. Accounts, cloud favorites, collections: replace storage in `lib/favorites/index.ts` with a server-backed one.
12. AI assistant: new route handler and UI; keep keys server-side.
13-14. Quizzes, community: new routes and data modules.
15. Advanced search: implement a new `SearchProvider`.
16. Mobile app: reuse `lib/` and `types/`.
17. Subscriptions: add auth first, then gating.