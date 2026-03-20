import { NextResponse } from "next/server";
import { getAllMapBreakdowns } from "@/lib/data";

export async function GET() {
  try {
    const breakdowns = getAllMapBreakdowns();
    return NextResponse.json(breakdowns);
  } catch (error) {
    console.error("Error fetching map breakdowns:", error);
    return NextResponse.json(
      { error: "Failed to fetch map breakdowns" },
      { status: 500 }
    );
  }
}
