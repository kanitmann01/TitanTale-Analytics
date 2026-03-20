import type { SeasonId } from "@/lib/season-types";
import { getTournamentInfo } from "@/lib/data/tournament";

const SITE = "TTL Stats";

export function pageTitle(pageName: string, seasonId: SeasonId): string {
  let seasonLabel: string;
  try {
    seasonLabel = getTournamentInfo(seasonId).tournamentName.replace(
      /^T90 Titans League\s*/i,
      "",
    );
  } catch {
    seasonLabel = seasonId.toUpperCase();
  }
  return `${pageName} | ${SITE} -- ${seasonLabel}`;
}

export const defaultDescription =
  "Tournament statistics and analytics for T90 Titans League.";
