import { describe, it, expect, vi, afterEach } from "vitest";
vi.mock("server-only", () => ({}));
import { fetchApod, getApodOrFallback } from "@/lib/nasa/client";

const ok = { date: "2024-01-01", title: "T", explanation: "E", url: "https://x.test/page", media_type: "image" };
afterEach(() => vi.restoreAllMocks());

describe("NASA client", () => {
  it("returns live data", async () => { vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(ok)))); expect((await fetchApod()).title).toBe("T"); });
  it("maps 429 to a rate limit error and falls back", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 429 })));
    await expect(fetchApod()).rejects.toMatchObject({ code: "rate_limit" });
    const r = await getApodOrFallback(); expect(r.source).toBe("fallback"); expect(r.notice).toMatch(/rate limit/);
  });
  it("retries once on network failure then stops", async () => {
    const f = vi.fn().mockRejectedValue(new Error("down")); vi.stubGlobal("fetch", f);
    await expect(fetchApod()).rejects.toMatchObject({ code: "network" }); expect(f).toHaveBeenCalledTimes(2);
  });
  it("calls the new WordPress APOD endpoint and ignores the legacy base URL", async () => {
    vi.stubEnv("NASA_API_BASE_URL", "https://api.nasa.gov");
    const f = vi.fn().mockResolvedValue(new Response(JSON.stringify(ok))); vi.stubGlobal("fetch", f);
    await fetchApod("2024-01-01");
    expect(String(f.mock.calls[0][0])).toContain("https://science.nasa.gov/wp-json/wp/v2/apod-basic");
    vi.unstubAllEnvs();
  });
  it("rejects invalid dates without calling NASA", async () => { const f = vi.fn(); vi.stubGlobal("fetch", f); await expect(fetchApod("bad")).rejects.toMatchObject({ code: "invalid" }); expect(f).not.toHaveBeenCalled(); });
  it("rejects unexpected payloads", async () => { vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ foo: 1 })))); await expect(fetchApod()).rejects.toMatchObject({ code: "invalid" }); });
});

describe("APOD URL building", () => {
  it("uses the legacy YYMMDD route for a date and per_page=1 for the latest", async () => {
    const f = vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify([ok]))));
    vi.stubGlobal("fetch", f);
    await fetchApod("2014-09-18");
    expect(String(f.mock.calls[0][0])).toBe("https://science.nasa.gov/wp-json/wp/v2/apod-basic/140918");
    await fetchApod();
    expect(String(f.mock.calls[1][0])).toBe("https://science.nasa.gov/wp-json/wp/v2/apod-basic?per_page=1");
    expect(String(f.mock.calls[1][0])).not.toMatch(/api_key|date=/);
  });
  it("maps 404 to a clear not-found error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 404 })));
    await expect(fetchApod("2024-01-01")).rejects.toMatchObject({ status: 404 });
  });
});
