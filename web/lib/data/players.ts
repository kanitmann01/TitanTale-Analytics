import type { Player } from "@/lib/types";
import type { SeasonId } from "@/lib/season-types";
import { parseCSV } from "./csv";
import { dataFilePath } from "./paths";

export function getPlayers(seasonId: SeasonId): Player[] {
  const rows = parseCSV(dataFilePath("players.csv", seasonId));
  return rows.map((row) => ({
    player_id: row.player_id,
    player_name: row.player_name,
    player_name_variants: row.player_name_variants,
    team: row.team || null,
    country: row.country || null,
    seed: row.seed ? Number(row.seed) : null,
  }));
}
