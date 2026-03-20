import type { MapOutcome } from "@/lib/types";
import { parseCSV } from "./csv";
import { dataFilePath } from "./paths";

export function getMapOutcomes(): MapOutcome[] {
  const rows = parseCSV(dataFilePath("map_outcomes.csv"));
  return rows.map((row) => ({
    league: row.league,
    map: row.map,
    num_games: Number(row.num_games),
    play_rate: row.play_rate,
  }));
}
