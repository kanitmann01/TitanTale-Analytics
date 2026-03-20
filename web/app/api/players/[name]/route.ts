import { NextResponse } from "next/server";
import { getPlayerProfile } from "@/lib/data";
import { seasonFromApiRequest } from "@/lib/api-season";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const seasonId = await seasonFromApiRequest(request);

  try {
    const profile = getPlayerProfile(seasonId, decodedName);

    if (!profile) {
      return NextResponse.json(
        { error: `Player '${decodedName}' not found` },
        { status: 404 },
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error(`Error fetching player profile for ${decodedName}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch player profile" },
      { status: 500 },
    );
  }
}
