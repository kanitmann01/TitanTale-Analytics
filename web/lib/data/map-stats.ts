import type { MapStats } from "@/lib/types";
import { MapStatsSchema } from "@/lib/schemas";
import { parseCSV } from "./csv";
import { dataFilePath } from "./paths";

export function getMapStats(): MapStats[] {
  const rows = parseCSV(dataFilePath("map_statistics.csv"));
  return rows.map((row) => MapStatsSchema.parse(row));
}
