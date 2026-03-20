import type { MapOutcome } from "@/lib/types";
import type { SeasonId } from "@/lib/season-types";
import { parseCSV } from "./csv";
import { dataFilePath } from "./paths";

export function getMapOutcomes(seasonId: SeasonId): MapOutcome[] {
  const rows = parseCSV(dataFilePath("map_outcomes.csv", seasonId));
  return rows.map((row) => ({
    league: row.league,
    map: row.map,
    num_games: Number(row.num_games),
    play_rate: row.play_rate,
  }));
}
