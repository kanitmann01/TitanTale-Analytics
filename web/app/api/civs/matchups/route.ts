import { NextResponse } from "next/server";
import { getCivMatchups, getCivMatchupsForCiv } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const civ = searchParams.get("civ");
  
  try {
    if (civ) {
      const matchups = getCivMatchupsForCiv(civ);
      return NextResponse.json(matchups);
    } else {
      const matchups = getCivMatchups();
      return NextResponse.json(matchups);
    }
  } catch (error) {
    console.error("Error fetching civ matchups:", error);
    return NextResponse.json(
      { error: "Failed to fetch civ matchups" },
      { status: 500 }
    );
  }
}
