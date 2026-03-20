import type { PlayerCivStats } from "@/lib/types";
import type { SeasonId } from "@/lib/season-types";
import { parseCSV } from "./csv";
import { dataFilePath } from "./paths";

export function getPlayerCivs(seasonId: SeasonId): PlayerCivStats[] {
  const rows = parseCSV(dataFilePath("player_civs.csv", seasonId));
  return rows.map((row) => ({
    league: row.league,
    civilization: row.civilization,
    wins: Number(row.wins),
    losses: Number(row.losses),
    winrate: row.winrate,
    total_games: Number(row.total_games),
  }));
}
