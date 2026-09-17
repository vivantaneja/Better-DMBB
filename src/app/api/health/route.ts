import { NextResponse } from "next/server";
import { getDataMode, getDmbbData } from "@/lib/data/dmbb";

export async function GET() {
  const payload = await getDmbbData();
  return NextResponse.json({
    ok: true,
    mode: getDataMode(),
    capturedAt: payload.capturedAt,
    counts: {
      fixtures: payload.fixtures.length,
      results: payload.results.length,
      competitions: payload.competitions.length,
      news: payload.news.length,
      standings: payload.standings.length,
    },
  });
}
