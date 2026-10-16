import { shiftDate, todayUtc } from "@/lib/nasa/apod";

/** NASA GIBS WMS (EPSG:4326, WMS 1.3.0 uses lat,lon axis order). Docs: https://nasa-gibs.github.io/gibs-api-docs/ */
export const GIBS_WMS = "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi";
export const GIBS_MIN_DATE = "2000-02-24";
const BASE_LAYER = "BlueMarble_NextGeneration";
const COASTLINES = "Coastlines_15m";
const MAX_DIM = 1280;

export interface GibsLayer { id: string; label: string; description: string; overlay?: boolean }
export const GIBS_LAYERS: GibsLayer[] = [
  { id: "MODIS_Terra_CorrectedReflectance_TrueColor", label: "True color (Terra / MODIS)", description: "Natural-color view of Earth as a camera would see it." },
  { id: "MODIS_Aqua_CorrectedReflectance_TrueColor", label: "True color (Aqua / MODIS)", description: "Natural-color view from the Aqua satellite." },
  { id: "VIIRS_SNPP_CorrectedReflectance_TrueColor", label: "True color (Suomi NPP / VIIRS)", description: "Natural-color view from Suomi NPP." },
  { id: "MODIS_Terra_Aerosol", label: "Aerosols (Terra / MODIS)", description: "Aerosol optical depth: haze, smoke and dust in the air.", overlay: true },
  { id: "IMERG_Precipitation_Rate", label: "Precipitation (IMERG)", description: "Estimated rainfall and snowfall rate.", overlay: true },
  { id: "VIIRS_SNPP_DayNightBand_ENCC", label: "Night lights (VIIRS)", description: "Light from cities and fires on the night side of Earth." },
];

export interface GibsRegion { id: string; label: string; bbox: [number, number, number, number] } // minLat, minLon, maxLat, maxLon
export const GIBS_REGIONS: GibsRegion[] = [
  { id: "world", label: "World", bbox: [-90, -180, 90, 180] },
  { id: "north-america", label: "North America", bbox: [15, -170, 75, -50] },
  { id: "south-america", label: "South America", bbox: [-56, -82, 13, -34] },
  { id: "europe", label: "Europe", bbox: [35, -12, 72, 45] },
  { id: "africa", label: "Africa", bbox: [-36, -20, 38, 55] },
  { id: "asia", label: "Asia", bbox: [0, 60, 70, 150] },
  { id: "oceania", label: "Oceania", bbox: [-48, 110, -8, 180] },
];

/** Latest date to offer: yesterday (UTC), because today's imagery is often incomplete. */
export const gibsMaxDate = () => shiftDate(todayUtc(), -1);

export interface GibsRequest { layerId: string; regionId: string; date: string; coastlines: boolean }
export type GibsResult = { ok: true; url: string; width: number; height: number } | { ok: false; error: string };

export function buildGibsUrl(req: GibsRequest, maxDate = gibsMaxDate()): GibsResult {
  const layer = GIBS_LAYERS.find((l) => l.id === req.layerId);
  if (!layer) return { ok: false, error: "Unknown imagery layer." };
  const region = GIBS_REGIONS.find((r) => r.id === req.regionId);
  if (!region) return { ok: false, error: "Unknown region." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(req.date) || Number.isNaN(Date.parse(`${req.date}T00:00:00Z`))) return { ok: false, error: "Date must use the format YYYY-MM-DD." };
  if (req.date < GIBS_MIN_DATE) return { ok: false, error: `Imagery starts around ${GIBS_MIN_DATE}.` };
  if (req.date > maxDate) return { ok: false, error: "Choose an earlier date; recent imagery is not ready yet." };
  const [minLat, minLon, maxLat, maxLon] = region.bbox;
  const w = maxLon - minLon, h = maxLat - minLat;
  const width = w >= h ? MAX_DIM : Math.round((MAX_DIM * w) / h);
  const height = w >= h ? Math.round((MAX_DIM * h) / w) : MAX_DIM;
  const layers = [...(layer.overlay ? [BASE_LAYER] : []), layer.id, ...(req.coastlines ? [COASTLINES] : [])].join(",");
  const q = new URLSearchParams({ SERVICE: "WMS", REQUEST: "GetMap", VERSION: "1.3.0", LAYERS: layers, STYLES: "", CRS: "EPSG:4326", BBOX: `${minLat},${minLon},${maxLat},${maxLon}`, WIDTH: String(width), HEIGHT: String(height), FORMAT: "image/jpeg", TIME: req.date });
  return { ok: true, url: `${GIBS_WMS}?${q.toString()}`, width, height };
}
