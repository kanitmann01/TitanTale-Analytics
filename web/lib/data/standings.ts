import type { GroupStanding } from "@/lib/types";
import { GroupStandingSchema } from "@/lib/schemas";
import { parseCSV } from "./csv";
import { dataFilePath } from "./paths";

export function getStandings(): GroupStanding[] {
  const rows = parseCSV(dataFilePath("matches.csv"));
  return rows.map((row) => GroupStandingSchema.parse(row));
}
