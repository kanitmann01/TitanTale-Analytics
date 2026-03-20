import type { CivilizationStats } from "@/lib/types";
import { CivilizationStatsSchema } from "@/lib/schemas";
import { parseCSV } from "./csv";
import { dataFilePath } from "./paths";

export function getCivStats(): CivilizationStats[] {
  const rows = parseCSV(dataFilePath("civilization_statistics.csv"));
  return rows.map((row) => CivilizationStatsSchema.parse(row));
}
