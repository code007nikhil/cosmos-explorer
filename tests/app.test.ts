import { describe, it, expect } from "vitest";
import { PLANETS } from "@/lib/planets/data";
import { searchIndex, LOCAL_INDEX } from "@/lib/search";
import { isFavoriteList, toggleFavorite } from "@/lib/favorites";
import { parseApod, validateApodDate, shiftDate } from "@/lib/nasa/apod";
import { formatDate } from "@/lib/utils/format";

describe("planet dataset", () => {
  it("has eight complete planets", () => {
    expect(PLANETS).toHaveLength(8);
    for (const p of PLANETS) {
      for (const k of ["slug", "name", "type", "dayLength", "yearLength", "moons", "summary", "fact", "composition", "atmosphere", "temperature"] as const) expect(p[k], `${p.slug}.${k}`).toBeTruthy();
      expect(p.radiusKm).toBeGreaterThan(0);
      expect(p.distanceMillionKm).toBeGreaterThan(0);
    }
    expect(new Set(PLANETS.map((p) => p.slug)).size).toBe(8);
  });
});
describe("search", () => {
  it("finds planets by name and ranks exact first", () => { expect(searchIndex(LOCAL_INDEX, "mars")[0].id).toBe("planet:mars"); });
  it("searches missions and gallery", () => { expect(searchIndex(LOCAL_INDEX, "hubble").length).toBeGreaterThan(0); expect(searchIndex(LOCAL_INDEX, "andromeda")[0].kind).toBe("gallery"); });
  it("returns nothing for empty or unmatched", () => { expect(searchIndex(LOCAL_INDEX, "  ")).toEqual([]); expect(searchIndex(LOCAL_INDEX, "zzzzqq")).toEqual([]); });
});
describe("favorites", () => {
  const item = { id: "planet:mars", type: "planet" as const, title: "Mars", href: "/planet/mars" };
  it("toggles on and off", () => { const a = toggleFavorite([], item, 1); expect(a).toHaveLength(1); expect(toggleFavorite(a, item)).toEqual([]); });
  it("rejects malformed data", () => { expect(isFavoriteList("x")).toBe(false); expect(isFavoriteList([{ id: 1 }])).toBe(false); expect(isFavoriteList([{ ...item, savedAt: 1 }])).toBe(true); });
});
describe("APOD", () => {
  const raw = { date: "2024-01-01", title: "T", explanation: "E", url: "https://x.test/page", media_type: "image", hdurl: "https://x.test/b.jpg", copyright: "A\nB", credit: "C", alt: "an alt" };
  it("parses a valid response", () => { const p = parseApod(raw); expect(p?.mediaType).toBe("image"); expect(p?.copyright).toBe("A B"); expect(p?.imageUrl).toBe("https://x.test/b.jpg"); expect(p?.pageUrl).toBe("https://x.test/page"); expect(parseApod([raw])?.title).toBe("T"); expect(parseApod({ ...raw, media_type: "video" })?.imageUrl).toBeUndefined(); });
  it("rejects invalid responses", () => { expect(parseApod(null)).toBeNull(); expect(parseApod({ ...raw, url: "javascript:alert(1)" })).toBeNull(); expect(parseApod({ ...raw, title: "" })).toBeNull(); });
  it("validates dates", () => {
    const t = "2024-06-01";
    expect(validateApodDate("2024-01-01", t)).toBeNull();
    expect(validateApodDate("2024/01/01", t)).toMatch(/format/);
    expect(validateApodDate("2024-02-30", t)).toMatch(/real/);
    expect(validateApodDate("1990-01-01", t)).toMatch(/starts/);
    expect(validateApodDate("2024-06-02", t)).toMatch(/Future/);
  });
  it("shifts dates", () => { expect(shiftDate("2024-03-01", -1)).toBe("2024-02-29"); });
});
describe("APOD HTML cleanup", () => {
  it("turns NASA HTML into plain text", () => {
    const html = '<strong>Explanation:</strong> The <a href="https://x.test">city &amp; lights</a> glow.<br><br><strong>Tomorrow\'s picture: </strong>Chasing the ISS';
    const p = parseApod({ date: "2024-01-01", title: "T &amp; U", explanation: html, url: "https://x.test/p", media_type: "image", credit: 'Image credit: <a href="https://i.test">Jane</a>, <a href="https://i.test">Joe</a>' });
    expect(p?.explanation).toBe("The city & lights glow.");
    expect(p?.title).toBe("T & U");
    expect(p?.credit).toBe("Jane, Joe");
    expect(p?.explanation).not.toMatch(/[<>]/);
  });
});
describe("utils", () => { it("formats dates", () => { expect(formatDate("2024-01-05")).toBe("January 5, 2024"); }); });

import { apodToday, toLegacyCode } from "@/lib/nasa/apod";
describe("APOD date helpers", () => {
  it("converts to NASA legacy codes", () => { expect(toLegacyCode("2014-09-18")).toBe("140918"); expect(toLegacyCode("2026-01-05")).toBe("260105"); });
  it("uses the US Eastern calendar date for 'today'", () => {
    expect(apodToday(new Date("2026-10-16T02:00:00Z"))).toBe("2026-10-15"); // still the 15th in New York
    expect(apodToday(new Date("2026-10-16T05:30:00Z"))).toBe("2026-10-16");
  });
  it("strips NASA site notices and 'Image Credit & Copyright' prefixes", () => {
    const p = parseApod({ date: "2026-10-01", title: "T", url: "https://x.test/p", media_type: "image",
      explanation: "<strong>Explanation: </strong>Real text.<br><br><strong>APOD's email for image submissions has changed.</strong> Please see: <a href=\"x\">APOD Submissions</a><br><strong>Tomorrow's picture: </strong>x",
      credit: "<b>Image Credit &amp; <a href=\"x\">Copyright</a>:</b> <a href=\"y\">Jane Doe</a>", copyright: "<b>Image Credit &amp; <a href=\"x\">Copyright</a>:</b> <a href=\"y\">Jane Doe</a>" });
    expect(p?.explanation).toBe("Real text.");
    expect(p?.credit).toBe("Jane Doe");
    expect(p?.copyright).toBe("Jane Doe");
  });
});
