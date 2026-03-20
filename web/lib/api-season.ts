import { cookies } from "next/headers";
import type { SeasonId } from "@/lib/season-types";
import { parseSeasonId, isValidSeasonId } from "@/lib/season-types";
import { listSeasonIdsOnDisk } from "@/lib/data/paths";

export async function seasonFromApiRequest(request: Request): Promise<SeasonId> {
  const url = new URL(request.url);
  const q = url.searchParams.get("season");
  const allowed = new Set(listSeasonIdsOnDisk());
  if (q && isValidSeasonId(q) && allowed.has(q.toLowerCase())) {
    return q.toLowerCase();
  }
  const jar = await cookies();
  const c = jar.get("ttl-season")?.value;
  const parsed = parseSeasonId(c);
  if (allowed.has(parsed)) {
    return parsed;
  }
  const first = listSeasonIdsOnDisk()[0];
  return first ?? parsed;
}
