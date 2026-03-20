import { NextResponse } from "next/server";
import { getMapBreakdown } from "@/lib/data";
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
    const breakdown = getMapBreakdown(seasonId, decodedName);

    if (!breakdown) {
      return NextResponse.json(
        { error: `Map '${decodedName}' not found` },
        { status: 404 },
      );
    }

    return NextResponse.json(breakdown);
  } catch (error) {
    console.error(`Error fetching map breakdown for ${decodedName}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch map breakdown" },
      { status: 500 },
    );
  }
}
