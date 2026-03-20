import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isValidSeasonId } from "@/lib/season-types";

const COOKIE = "ttl-season";

export function middleware(request: NextRequest) {
  const season = request.nextUrl.searchParams.get("season");
  if (season && isValidSeasonId(season)) {
    const res = NextResponse.next();
    res.cookies.set(COOKIE, season.toLowerCase(), {
      path: "/",
      maxAge: 60 * 60 * 24 * 400,
      sameSite: "lax",
    });
    return res;
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|favicon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
