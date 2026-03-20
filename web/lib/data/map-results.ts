import type { MapResult } from "@/lib/types";
import type { SeasonId } from "@/lib/season-types";
import { parseCSV } from "./csv";
import { dataFilePath } from "./paths";

export function getMapResults(seasonId: SeasonId): MapResult[] {
  const rows = parseCSV(dataFilePath("map_results.csv", seasonId));
  return rows.map((row) => ({
    match_id: row.match_id,
    game_number: Number(row.game_number),
    map: row.map,
    player1: row.player1,
    player2: row.player2,
    player1_civ: row.player1_civ,
    player2_civ: row.player2_civ,
    winner: row.winner,
    duration: row.duration,
    player1_score: row.player1_score ? Number(row.player1_score) : null,
    player2_score: row.player2_score ? Number(row.player2_score) : null,
  }));
}
