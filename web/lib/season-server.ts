import { cache } from "react";
import { cookies } from "next/headers";
import { parseSeasonId, type SeasonId } from "@/lib/season-types";
import { listSeasonIdsOnDisk } from "@/lib/data/paths";

const COOKIE_NAME = "ttl-season";

export function getSeasonCookieName(): string {
  return COOKIE_NAME;
}

export const getSeasonId = cache(async (): Promise<SeasonId> => {
  const jar = await cookies();
  const raw = jar.get(COOKIE_NAME)?.value;
  const parsed = parseSeasonId(raw);
  const allowed = new Set(listSeasonIdsOnDisk());
  if (allowed.has(parsed)) {
    return parsed;
  }
  const first = listSeasonIdsOnDisk()[0];
  return first ?? parsed;
});

export async function listSeasonsForNav(): Promise<SeasonId[]> {
  return listSeasonIdsOnDisk();
}
