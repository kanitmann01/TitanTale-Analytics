import { NextResponse } from "next/server";
import { getPlayerProfile } from "@/lib/data";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  
  try {
    const profile = getPlayerProfile(decodedName);
    
    if (!profile) {
      return NextResponse.json(
        { error: `Player '${decodedName}' not found` },
        { status: 404 }
      );
    }
    
    return NextResponse.json(profile);
  } catch (error) {
    console.error(`Error fetching player profile for ${decodedName}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch player profile" },
      { status: 500 }
    );
  }
}
