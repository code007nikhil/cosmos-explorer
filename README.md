# Cosmos Explorer

An independent, educational space-exploration website. Explore an interactive 3D solar system, read about the eight planets, see NASA's Astronomy Picture of the Day, browse live satellite imagery of Earth, and search the NASA Image and Video Library.

> **Disclaimer:** Cosmos Explorer is not affiliated with, endorsed by, or sponsored by NASA. NASA names and data are used only to credit and link to their public sources.


## Features

| Page | Route | What it does |
|---|---|---|
| Home | `/` | Landing page and entry points |
| Solar system | `/solar-system` | Interactive 3D scene (React Three Fiber). Click a planet to focus the camera and open an info panel |
| Planets | `/planet/<name>` | Eight planet pages with facts from the NASA Planetary Fact Sheet |
| APOD | `/apod` | NASA Astronomy Picture of the Day, browsable by date |
| Earth | `/earth` | Satellite imagery from NASA GIBS: true color, aerosols, precipitation and night lights, by region and date (since 2000) |
| Gallery | `/gallery` | Live search of the NASA Image and Video Library with category filters (galaxies, nebulae, planets, stars, missions), credits and links to originals |
| Missions | `/missions` | Curated list of missions, each linking to its NASA page |
| Favorites | `/favorites` | Save planets, images and more, stored in your browser |
| Search | top bar | Local site search |
| About | `/about` | Project and data-source notes |

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 3 · three.js with React Three Fiber and drei · lucide-react · Vitest · ESLint

## Getting started

Requires the current **Node.js LTS** (includes npm). No database, paid service, Docker, or account is needed.

```bash
git clone https://github.com/code007nikhil/cosmos-explorer.git
cd cosmos-explorer
npm install
```

Create your local environment file:

- macOS / Linux: `cp .env.example .env.local`
- Windows PowerShell: `Copy-Item .env.example .env.local`

Then start the dev server and open <http://localhost:3000>:

```bash
npm run dev
```

### Scripts

| Task | Command |
|---|---|
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Production start | `npm start` |
| Type check | `npm run typecheck` |
| Lint | `npm run lint` |
| Tests | `npm test` |

### Environment variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `NASA_API_KEY` | No | `DEMO_KEY` | NASA API key for APOD. Get a free key at <https://api.nasa.gov/>. Server-side only, never sent to the browser |
| `NASA_API_BASE_URL` | No | `https://api.nasa.gov` | Base URL for NASA Open APIs |
| `NEXT_PUBLIC_APP_NAME` | No | `Cosmos Explorer` | Site name used in the UI and metadata |
| `NEXT_PUBLIC_SITE_URL` | No | `http://localhost:3000` | Public URL used for metadata, sitemap and robots. On Vercel it falls back to the production domain automatically |

Never commit `.env.local`. It is git-ignored; only `.env.example` is tracked.

## Data sources and modes

- **APOD** (NASA Open APIs). With a configured key it runs normally. `DEMO_KEY` works with stricter rate limits. If NASA is unreachable or rate limited, bundled sample content is shown with a visible "Sample content" label and is never presented as live.
- **Gallery** (NASA Image and Video Library, `images-api.nasa.gov`). Searches run server-side through `/api/nasa/images`. Only image results with NASA-hosted (`*.nasa.gov`, HTTPS) previews are shown. A small curated manifest in `lib/gallery/data.ts` is also included. Broken images fall back gracefully.
- **Earth imagery** (NASA GIBS WMS). Image URLs are built client-side from a fixed set of layers and regions. No key is needed.
- **Planet data** (NASA Planetary Fact Sheet, linked on each page). Temperatures are surface means for rocky planets and 1 bar values for giants. Moon counts change over time.
- **Missions.** Status text is not live-verified. Each card links to its NASA page.

## Accuracy notes

- The 3D scene uses an **illustrative scale**, and orbital motion is a simple simulation, not an ephemeris.
- No third-party images or textures are bundled. Planet visuals are original CSS/WebGL.

## Security, caching and limits

- The NASA API key is read server-side only.
- API routes validate their input (a date for APOD, a 2 to 100 character query and page 1 to 20 for images) and never fetch arbitrary URLs.
- APOD responses are revalidated every 3600 s (`APOD_REVALIDATE` in `lib/nasa/client.ts`). API routes send `s-maxage=3600` cache headers, and errors are not cached.
- This MVP has caching only. It has no rate limiter, because an in-memory one is unreliable across multiple serverless instances. Bot detection, a WAF and per-user quotas are out of scope.

## Favorites

Stored in browser localStorage under `cosmos:favorites:v1`. They are browser-specific and do not sync between devices.

## Project structure

```
app/          Routes and API handlers (server components by default)
components/   UI by area; 3D code is lazy-loaded (ssr: false)
lib/          NASA client, GIBS, planets, missions, gallery, search, favorites, storage
types/        Shared TypeScript types
tests/        Vitest tests
docs/         ARCHITECTURE.md and ASSETS.md
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for details and planned extension points, and [`docs/ASSETS.md`](docs/ASSETS.md) for attribution.

## Deploy free (Vercel Hobby)

1. Push the repo to GitHub.
2. In Vercel choose **Add New → Project** and import the repo.
3. Add environment variable `NASA_API_KEY` (and optionally `NEXT_PUBLIC_SITE_URL` with your deployed URL).
4. Deploy, then run the smoke test below on the live URL.

Free-tier limits and terms change; check Vercel's current terms, especially for commercial use. Do not assume unlimited usage.

## Smoke-test checklist

- Home loads.
- `/solar-system` loads, and clicking a planet focuses it and opens the panel.
- All 8 `/planet/<name>` routes load.
- `/apod` shows content (labelled sample content if no key or rate limited).
- `/earth` loads imagery, and changing layer, region and date works.
- `/gallery` shows results, and a search and a category chip work.
- Save and remove a favorite on `/favorites`.
- Search "mars" in the top bar.
- The mobile menu opens and closes.
- `npm run build` succeeds.

## Credits

Data and imagery courtesy of NASA, including the NASA Open APIs, NASA Image and Video Library, GIBS, and the Planetary Fact Sheet. See individual items for their credits. Follow the [NASA media usage guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/) if you reuse NASA content.

## License

Add a license before making the repo public (for example MIT) and put it in a `LICENSE` file. Without one, others have no permission to reuse your code.