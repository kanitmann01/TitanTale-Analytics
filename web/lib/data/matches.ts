import type { TTLMatch } from "@/lib/types";
import { TTLMatchSchema } from "@/lib/schemas";
import type { SeasonId } from "@/lib/season-types";
import { parseCSV } from "./csv";
import { dataFilePath } from "./paths";

export function getMatches(seasonId: SeasonId): TTLMatch[] {
  const rows = parseCSV(dataFilePath("ttl_s5_matches.csv", seasonId));
  return rows.map((row) => TTLMatchSchema.parse(row));
}
