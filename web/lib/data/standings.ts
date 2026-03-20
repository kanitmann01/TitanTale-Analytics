import type { GroupStanding } from "@/lib/types";
import { GroupStandingSchema } from "@/lib/schemas";
import type { SeasonId } from "@/lib/season-types";
import { parseCSV } from "./csv";
import { dataFilePath } from "./paths";

export function getStandings(seasonId: SeasonId): GroupStanding[] {
  const rows = parseCSV(dataFilePath("matches.csv", seasonId));
  return rows.map((row) => GroupStandingSchema.parse(row));
}
