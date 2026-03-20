import { NextResponse } from "next/server";
import { getMapBreakdown } from "@/lib/data";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  
  try {
    const breakdown = getMapBreakdown(decodedName);
    
    if (!breakdown) {
      return NextResponse.json(
        { error: `Map '${decodedName}' not found` },
        { status: 404 }
      );
    }
    
    return NextResponse.json(breakdown);
  } catch (error) {
    console.error(`Error fetching map breakdown for ${decodedName}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch map breakdown" },
      { status: 500 }
    );
  }
}
