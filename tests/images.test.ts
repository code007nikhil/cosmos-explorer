import { describe, it, expect, vi, afterEach } from "vitest";
vi.mock("server-only", () => ({}));
import { parseImages, validateImageQuery } from "@/lib/nasa/images";
import { fetchImages } from "@/lib/nasa/client";

const payload = {
  collection: {
    metadata: { total_hits: 100 },
    items: [
      { data: [{ nasa_id: "PIA1", title: "Jupiter &amp; Io", description: "<b>Big</b> planet", media_type: "image", photographer: "NASA/JPL" }], links: [{ rel: "preview", href: "https://images-assets.nasa.gov/image/PIA1/PIA1~thumb.jpg" }] },
      { data: [{ nasa_id: "V1", title: "A video", media_type: "video" }], links: [] },
      { data: [{ nasa_id: "PIA2", title: "Bad host", media_type: "image" }], links: [{ rel: "preview", href: "https://evil.test/x.jpg" }] },
      { data: [{ title: "No id" }] },
    ],
  },
};
afterEach(() => vi.restoreAllMocks());

describe("NASA image library", () => {
  it("validates queries", () => {
    expect(validateImageQuery("mars", 1)).toBeNull();
    expect(validateImageQuery("a", 1)).toMatch(/2 to 100/);
    expect(validateImageQuery("mars", 0)).toMatch(/Page/);
    expect(validateImageQuery("x".repeat(101), 1)).toMatch(/2 to 100/);
  });
  it("parses items, skips videos and malformed entries, rejects non-NASA image hosts", () => {
    const r = parseImages(payload, 1)!;
    expect(r.items.map((i) => i.id)).toEqual(["nasa:PIA1", "nasa:PIA2"]);
    expect(r.items[0].title).toBe("Jupiter & Io");
    expect(r.items[0].description).toBe("Big planet");
    expect(r.items[0].imageUrl).toContain("images-assets.nasa.gov");
    expect(r.items[1].imageUrl).toBeUndefined();
    expect(r.items[0].sourceUrl).toBe("https://images.nasa.gov/details/PIA1");
    expect(r.hasMore).toBe(true);
  });
  it("returns null for unexpected payloads", () => { expect(parseImages({}, 1)).toBeNull(); expect(parseImages(null, 1)).toBeNull(); });
  it("fetches and maps errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(payload))));
    expect((await fetchImages("jupiter")).items).toHaveLength(2);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 429 })));
    await expect(fetchImages("jupiter")).rejects.toMatchObject({ code: "rate_limit" });
    const f = vi.fn(); vi.stubGlobal("fetch", f);
    await expect(fetchImages("a")).rejects.toMatchObject({ code: "invalid" }); expect(f).not.toHaveBeenCalled();
  });
});
