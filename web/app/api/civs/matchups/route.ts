import { NextResponse } from "next/server";
import { getCivMatchups, getCivMatchupsForCiv } from "@/lib/data";
import { seasonFromApiRequest } from "@/lib/api-season";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const civ = searchParams.get("civ");

  try {
    const seasonId = await seasonFromApiRequest(request);
    if (civ) {
      const matchups = getCivMatchupsForCiv(seasonId, civ);
      return NextResponse.json(matchups);
    }
    const matchups = getCivMatchups(seasonId);
    return NextResponse.json(matchups);
  } catch (error) {
    console.error("Error fetching civ matchups:", error);
    return NextResponse.json(
      { error: "Failed to fetch civ matchups" },
      { status: 500 },
    );
  }
}
