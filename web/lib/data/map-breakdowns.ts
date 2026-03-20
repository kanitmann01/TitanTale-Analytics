import type { MapBreakdown, MapCivPopularity, MapDurationTrend } from "@/lib/types";
import { MapBreakdownSchema } from "@/lib/schemas";
import type { SeasonId } from "@/lib/season-types";
import { getMatches } from "./matches";
import { getMapStats } from "./map-stats";

export function getMapBreakdown(
  seasonId: SeasonId,
  mapName: string,
): MapBreakdown | null {
  const matches = getMatches(seasonId);
  const allMapStats = getMapStats(seasonId);

  const mapStats = allMapStats.find((m) => m.map === mapName);
  if (!mapStats) {
    return null;
  }

  const mapMatches = matches.filter((m) => m.map === mapName);

  if (mapMatches.length === 0) {
    return null;
  }

  const civStats = new Map<string, { games: number; wins: number }>();

  const durationBuckets = new Map<string, number>();
  const bucketSize = 10;

  for (const match of mapMatches) {
    for (const civ of [match.player1_civ, match.player2_civ]) {
      const current = civStats.get(civ) || { games: 0, wins: 0 };
      current.games++;
      const winnerCiv =
        match.winner === match.player1 ? match.player1_civ : match.player2_civ;
      if (winnerCiv === civ) {
        current.wins++;
      }
      civStats.set(civ, current);
    }

    const bucketIndex = Math.floor(match.duration_minutes / bucketSize);
    const bucketKey = `${bucketIndex * bucketSize}-${(bucketIndex + 1) * bucketSize}m`;
    durationBuckets.set(bucketKey, (durationBuckets.get(bucketKey) || 0) + 1);
  }

  const civPopularity: MapCivPopularity[] = Array.from(civStats.entries())
    .map(([civilization, stats]) => ({
      civilization,
      games_played: stats.games,
      pick_rate: stats.games / (mapMatches.length * 2),
      win_rate: stats.wins / stats.games,
    }))
    .sort((a, b) => b.games_played - a.games_played);

  const durationTrends: MapDurationTrend[] = Array.from(
    durationBuckets.entries(),
  )
    .map(([duration_bucket, games_count]) => {
      const [start] = duration_bucket.split("-").map((s) => parseInt(s, 10));
      return {
        duration_bucket,
        games_count,
        avg_duration: start + bucketSize / 2,
      };
    })
    .sort((a, b) => {
      const aStart = parseInt(a.duration_bucket, 10);
      const bStart = parseInt(b.duration_bucket, 10);
      return aStart - bStart;
    });

  const breakdown: MapBreakdown = {
    map: mapName,
    total_games: mapStats.total_games,
    avg_duration: mapStats.avg_duration,
    most_common_civ: mapStats.most_common_civ,
    balance_std: mapStats.balance_std,
    civ_popularity: civPopularity,
    duration_trends: durationTrends,
  };

  return MapBreakdownSchema.parse(breakdown);
}

export function getAllMapBreakdowns(seasonId: SeasonId): MapBreakdown[] {
  const mapStats = getMapStats(seasonId);
  const breakdowns: MapBreakdown[] = [];

  for (const stats of mapStats) {
    const breakdown = getMapBreakdown(seasonId, stats.map);
    if (breakdown) {
      breakdowns.push(breakdown);
    }
  }

  breakdowns.sort((a, b) => b.total_games - a.total_games);

  return breakdowns;
}
