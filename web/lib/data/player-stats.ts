import type { PlayerStats } from "@/lib/types";
import { PlayerStatsSchema } from "@/lib/schemas";
import { parseCSV } from "./csv";
import { dataFilePath } from "./paths";

export function getPlayerStats(): PlayerStats[] {
  const rows = parseCSV(dataFilePath("player_statistics.csv"));
  return rows.map((row) =>
    PlayerStatsSchema.parse({
      ...row,
      elo: row.elo === "" ? null : row.elo,
    })
  );
}
