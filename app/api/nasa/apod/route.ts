import { NextResponse } from "next/server";
import { fetchApod } from "@/lib/nasa/client";
import { NasaError } from "@/lib/nasa/types";

export async function GET(req: Request) {
  const date = new URL(req.url).searchParams.get("date") ?? undefined;
  try {
    const data = await fetchApod(date);
    return NextResponse.json({ source: "live", data }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" } });
  } catch (e) {
    const err = e instanceof NasaError ? e : new NasaError("Unexpected error.", "upstream");
    return NextResponse.json({ error: err.message, code: err.code }, { status: err.status, headers: { "Cache-Control": "no-store" } });
  }
}
