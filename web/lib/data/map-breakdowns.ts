import type { MapBreakdown, MapCivPopularity, MapDurationTrend } from "@/lib/types";
import { MapBreakdownSchema } from "@/lib/schemas";
import { getMatches } from "./matches";
import { getMapStats } from "./map-stats";

export function getMapBreakdown(mapName: string): MapBreakdown | null {
  const matches = getMatches();
  const allMapStats = getMapStats();
  
  // Get base map stats
  const mapStats = allMapStats.find(m => m.map === mapName);
  if (!mapStats) {
    return null;
  }

  // Filter matches for this map
  const mapMatches = matches.filter(m => m.map === mapName);
  
  if (mapMatches.length === 0) {
    return null;
  }

  // Calculate civ popularity on this map
  const civStats = new Map<string, { 
    games: number; 
    wins: number;
  }>();

  // Calculate duration distribution
  const durationBuckets = new Map<string, number>();
  const bucketSize = 10; // 10-minute buckets

  for (const match of mapMatches) {
    // Track both civs
    for (const civ of [match.player1_civ, match.player2_civ]) {
      const current = civStats.get(civ) || { games: 0, wins: 0 };
      current.games++;
      const winnerCiv = match.winner === match.player1 ? match.player1_civ : match.player2_civ;
      if (winnerCiv === civ) {
        current.wins++;
      }
      civStats.set(civ, current);
    }

    // Track duration bucket
    const bucketIndex = Math.floor(match.duration_minutes / bucketSize);
    const bucketKey = `${bucketIndex * bucketSize}-${(bucketIndex + 1) * bucketSize}m`;
    durationBuckets.set(bucketKey, (durationBuckets.get(bucketKey) || 0) + 1);
  }

  // Build civ popularity array
  const civPopularity: MapCivPopularity[] = Array.from(civStats.entries())
    .map(([civilization, stats]) => ({
      civilization,
      games_played: stats.games,
      pick_rate: stats.games / (mapMatches.length * 2), // 2 civs per game
      win_rate: stats.wins / stats.games,
    }))
    .sort((a, b) => b.games_played - a.games_played);

  // Build duration trends
  const durationTrends: MapDurationTrend[] = Array.from(durationBuckets.entries())
    .map(([duration_bucket, games_count]) => {
      const [start] = duration_bucket.split('-').map(s => parseInt(s));
      return {
        duration_bucket,
        games_count,
        avg_duration: start + bucketSize / 2, // Middle of bucket
      };
    })
    .sort((a, b) => {
      const aStart = parseInt(a.duration_bucket);
      const bStart = parseInt(b.duration_bucket);
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

export function getAllMapBreakdowns(): MapBreakdown[] {
  const mapStats = getMapStats();
  const breakdowns: MapBreakdown[] = [];

  for (const stats of mapStats) {
    const breakdown = getMapBreakdown(stats.map);
    if (breakdown) {
      breakdowns.push(breakdown);
    }
  }

  // Sort by total games descending
  breakdowns.sort((a, b) => b.total_games - a.total_games);

  return breakdowns;
}
