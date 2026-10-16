import { describe, it, expect } from "vitest";
import { buildGibsUrl } from "@/lib/gibs";

const max = "2024-06-01";
const base = { layerId: "MODIS_Terra_CorrectedReflectance_TrueColor", regionId: "world", date: "2024-05-01", coastlines: true };

describe("GIBS URL builder", () => {
  it("builds a WMS 1.3.0 world request with lat,lon bbox", () => {
    const r = buildGibsUrl(base, max);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const u = new URL(r.url);
    expect(u.origin + u.pathname).toBe("https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi");
    expect(u.searchParams.get("BBOX")).toBe("-90,-180,90,180");
    expect(u.searchParams.get("LAYERS")).toBe("MODIS_Terra_CorrectedReflectance_TrueColor,Coastlines_15m");
    expect(u.searchParams.get("TIME")).toBe("2024-05-01");
    expect([r.width, r.height]).toEqual([1280, 640]);
  });
  it("adds a base layer under overlay layers and omits coastlines when off", () => {
    const r = buildGibsUrl({ ...base, layerId: "IMERG_Precipitation_Rate", coastlines: false }, max);
    expect(r.ok && new URL(r.url).searchParams.get("LAYERS")).toBe("BlueMarble_NextGeneration,IMERG_Precipitation_Rate");
  });
  it("keeps region aspect ratio within the size limit", () => {
    const r = buildGibsUrl({ ...base, regionId: "south-america" }, max);
    expect(r.ok && Math.max(r.width, r.height)).toBe(1280);
  });
  it("rejects unknown layers, regions and bad dates", () => {
    expect(buildGibsUrl({ ...base, layerId: "evil&x=1" }, max).ok).toBe(false);
    expect(buildGibsUrl({ ...base, regionId: "moon" }, max).ok).toBe(false);
    expect(buildGibsUrl({ ...base, date: "nope" }, max).ok).toBe(false);
    expect(buildGibsUrl({ ...base, date: "1999-01-01" }, max).ok).toBe(false);
    expect(buildGibsUrl({ ...base, date: "2024-06-02" }, max).ok).toBe(false);
  });
});
