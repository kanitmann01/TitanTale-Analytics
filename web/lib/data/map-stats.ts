import type { MapStats } from "@/lib/types";
import { MapStatsSchema } from "@/lib/schemas";
import type { SeasonId } from "@/lib/season-types";
import { parseCSV } from "./csv";
import { dataFilePath } from "./paths";

export function getMapStats(seasonId: SeasonId): MapStats[] {
  const rows = parseCSV(dataFilePath("map_statistics.csv", seasonId));
  return rows.map((row) => MapStatsSchema.parse(row));
}
