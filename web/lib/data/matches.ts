import type { TTLMatch } from "@/lib/types";
import { TTLMatchSchema } from "@/lib/schemas";
import { parseCSV } from "./csv";
import { dataFilePath } from "./paths";

export function getMatches(): TTLMatch[] {
  const rows = parseCSV(dataFilePath("ttl_s5_matches.csv"));
  return rows.map((row) => TTLMatchSchema.parse(row));
}
