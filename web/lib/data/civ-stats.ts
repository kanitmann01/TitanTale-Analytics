import type { CivilizationStats } from "@/lib/types";
import { CivilizationStatsSchema } from "@/lib/schemas";
import type { SeasonId } from "@/lib/season-types";
import { parseCSV } from "./csv";
import { dataFilePath } from "./paths";

export function getCivStats(seasonId: SeasonId): CivilizationStats[] {
  const rows = parseCSV(dataFilePath("civilization_statistics.csv", seasonId));
  return rows.map((row) => CivilizationStatsSchema.parse(row));
}
