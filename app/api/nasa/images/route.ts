import { NextResponse } from "next/server";
import { fetchImages } from "@/lib/nasa/client";
import { NasaError } from "@/lib/nasa/types";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const q = sp.get("q") ?? "";
  const page = Number(sp.get("page") ?? "1");
  try {
    const data = await fetchImages(q, page);
    return NextResponse.json(data, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" } });
  } catch (e) {
    const err = e instanceof NasaError ? e : new NasaError("Unexpected error.", "upstream");
    return NextResponse.json({ error: err.message, code: err.code }, { status: err.status, headers: { "Cache-Control": "no-store" } });
  }
}
