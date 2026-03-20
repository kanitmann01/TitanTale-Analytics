import type { CivDraft } from "@/lib/types";
import type { SeasonId } from "@/lib/season-types";
import { parseCSV } from "./csv";
import { dataFilePath } from "./paths";

export function getCivDrafts(seasonId: SeasonId): CivDraft[] {
  const rows = parseCSV(dataFilePath("civ_drafts.csv", seasonId));
  return rows.map((row) => ({
    match_id: row.match_id,
    game_number: Number(row.game_number),
    map: row.map,
    player1_civ: row.player1_civ,
    player2_civ: row.player2_civ,
    player1_civ_draft_order: row.player1_civ_draft_order
      ? Number(row.player1_civ_draft_order)
      : null,
    player2_civ_draft_order: row.player2_civ_draft_order
      ? Number(row.player2_civ_draft_order)
      : null,
    winner_civ: row.winner_civ,
    winner: row.winner,
  }));
}
