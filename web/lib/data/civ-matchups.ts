import type { CivMatchup } from "@/lib/types";
import { CivMatchupSchema } from "@/lib/schemas";
import { getMatches } from "./matches";

export function getCivMatchups(): CivMatchup[] {
  const matches = getMatches();
  const matchupMap = new Map<string, { 
    games: number; 
    civ1Wins: number; 
    civ2Wins: number;
    totalDuration: number;
  }>();

  for (const match of matches) {
    // Create a consistent key for the matchup (alphabetical order)
    const civs = [match.player1_civ, match.player2_civ].sort();
    const key = `${civs[0]}|${civs[1]}`;

    const current = matchupMap.get(key) || { 
      games: 0, 
      civ1Wins: 0, 
      civ2Wins: 0,
      totalDuration: 0 
    };

    current.games++;
    current.totalDuration += match.duration_minutes;

    // Determine which civ won based on winner
    const winnerCiv = match.winner === match.player1 ? match.player1_civ : match.player2_civ;
    if (winnerCiv === civs[0]) {
      current.civ1Wins++;
    } else if (winnerCiv === civs[1]) {
      current.civ2Wins++;
    }

    matchupMap.set(key, current);
  }

  const matchups: CivMatchup[] = [];
  for (const [key, stats] of Array.from(matchupMap.entries())) {
    const [civ1, civ2] = key.split('|');
    
    matchups.push({
      civilization1: civ1,
      civilization2: civ2,
      games_played: stats.games,
      civ1_wins: stats.civ1Wins,
      civ2_wins: stats.civ2Wins,
      civ1_win_rate: stats.civ1Wins / stats.games,
      avg_duration: stats.totalDuration / stats.games,
    });
  }

  // Sort by games played descending
  matchups.sort((a, b) => b.games_played - a.games_played);

  return matchups.map(m => CivMatchupSchema.parse(m));
}

export function getCivMatchupsForCiv(civilization: string): CivMatchup[] {
  const allMatchups = getCivMatchups();
  return allMatchups.filter(
    m => m.civilization1 === civilization || m.civilization2 === civilization
  );
}
