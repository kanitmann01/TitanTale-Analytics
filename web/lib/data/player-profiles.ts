import type {
  PlayerProfile,
  PlayerMatchHistory,
  PlayerCivPreference,
  PlayerStats,
} from "@/lib/types";
import { PlayerProfileSchema } from "@/lib/schemas";
import type { SeasonId } from "@/lib/season-types";
import { getMatches } from "./matches";
import { getPlayerStats } from "./player-stats";

export function getPlayerProfile(
  seasonId: SeasonId,
  playerName: string,
): PlayerProfile | null {
  const matches = getMatches(seasonId);
  const allPlayerStats = getPlayerStats(seasonId);

  const playerStats = allPlayerStats.find((p) => p.player === playerName);
  if (!playerStats) {
    return null;
  }

  const matchHistory: PlayerMatchHistory[] = [];
  const civStats = new Map<
    string,
    { games: number; wins: number; losses: number }
  >();

  for (const match of matches) {
    if (match.player1 === playerName || match.player2 === playerName) {
      const isPlayer1 = match.player1 === playerName;
      const playerCiv = isPlayer1 ? match.player1_civ : match.player2_civ;
      const opponentCiv = isPlayer1 ? match.player2_civ : match.player1_civ;
      const opponent = isPlayer1 ? match.player2 : match.player1;
      const playerElo = isPlayer1 ? match.player1_elo : match.player2_elo;
      const opponentElo = isPlayer1 ? match.player2_elo : match.player1_elo;
      const won = match.winner === playerName;

      matchHistory.push({
        match_id: match.match_id,
        game_number: match.game_number,
        opponent,
        player_civ: playerCiv,
        opponent_civ: opponentCiv,
        map: match.map,
        duration_minutes: match.duration_minutes,
        result: won ? "win" : "loss",
        stage: match.stage,
        player_elo: playerElo,
        opponent_elo: opponentElo,
      });

      const currentCivStats = civStats.get(playerCiv) || {
        games: 0,
        wins: 0,
        losses: 0,
      };
      currentCivStats.games++;
      if (won) {
        currentCivStats.wins++;
      } else {
        currentCivStats.losses++;
      }
      civStats.set(playerCiv, currentCivStats);
    }
  }

  matchHistory.sort(
    (a, b) => b.match_id - a.match_id || b.game_number - a.game_number,
  );

  const civPreferences: PlayerCivPreference[] = Array.from(civStats.entries())
    .map(([civilization, stats]) => ({
      civilization,
      games_played: stats.games,
      wins: stats.wins,
      losses: stats.losses,
      win_rate: stats.wins / stats.games,
    }))
    .sort((a, b) => b.games_played - a.games_played);

  const profile: PlayerProfile = {
    player_name: playerName,
    total_games: playerStats.total_games,
    wins: playerStats.wins,
    losses: playerStats.losses,
    win_rate: playerStats.win_rate,
    elo: playerStats.elo,
    avg_game_duration: playerStats.avg_game_duration,
    unique_civs: playerStats.unique_civs,
    unique_maps: playerStats.unique_maps,
    match_history: matchHistory,
    civ_preferences: civPreferences,
  };

  return PlayerProfileSchema.parse(profile);
}

export function getAllPlayerProfiles(seasonId: SeasonId): PlayerProfile[] {
  const playerStats = getPlayerStats(seasonId);
  const profiles: PlayerProfile[] = [];

  for (const stats of playerStats) {
    const profile = getPlayerProfile(seasonId, stats.player);
    if (profile) {
      profiles.push(profile);
    }
  }

  return profiles;
}
