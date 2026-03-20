import type { PlayerStats } from "@/lib/types";
import { PlayerStatsSchema } from "@/lib/schemas";
import type { SeasonId } from "@/lib/season-types";
import { parseCSV } from "./csv";
import { dataFilePath } from "./paths";

export function getPlayerStats(seasonId: SeasonId): PlayerStats[] {
  const rows = parseCSV(dataFilePath("player_statistics.csv", seasonId));
  return rows.map((row) =>
    PlayerStatsSchema.parse({
      ...row,
      elo: row.elo === "" ? null : row.elo,
    })
  );
}
