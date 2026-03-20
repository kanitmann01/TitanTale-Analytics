import { NextResponse } from "next/server";
import { getAllMapBreakdowns } from "@/lib/data";
import { seasonFromApiRequest } from "@/lib/api-season";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const seasonId = await seasonFromApiRequest(request);
    const breakdowns = getAllMapBreakdowns(seasonId);
    return NextResponse.json(breakdowns);
  } catch (error) {
    console.error("Error fetching map breakdowns:", error);
    return NextResponse.json(
      { error: "Failed to fetch map breakdowns" },
      { status: 500 },
    );
  }
}
