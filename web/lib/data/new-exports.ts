import type {
  PlayerH2H,
  PlayerAdvancedMetrics,
  ScoutingReport,
  DraftPositionOutcome,
} from "@/lib/types";
import {
  PlayerH2HSchema,
  PlayerAdvancedMetricsSchema,
  ScoutingReportSchema,
  DraftPositionOutcomeSchema,
} from "@/lib/schemas";
import type { SeasonId } from "@/lib/season-types";
import { parseCSV } from "./csv";
import { dataFilePath } from "./paths";

export function getPlayerH2H(seasonId: SeasonId): PlayerH2H[] {
  return parseCSV(dataFilePath("player_h2h.csv", seasonId)).map((r) =>
    PlayerH2HSchema.parse(r),
  );
}

export function getPlayerH2HFor(
  seasonId: SeasonId,
  player: string,
): PlayerH2H[] {
  return getPlayerH2H(seasonId).filter(
    (h) => h.player_a === player || h.player_b === player,
  );
}

export function getPlayerH2HPair(
  seasonId: SeasonId,
  a: string,
  b: string,
): PlayerH2H | null {
  const [pa, pb] = [a, b].sort();
  return (
    getPlayerH2H(seasonId).find(
      (h) => h.player_a === pa && h.player_b === pb,
    ) ?? null
  );
}

export function getAdvancedMetrics(
  seasonId: SeasonId,
): PlayerAdvancedMetrics[] {
  return parseCSV(dataFilePath("player_advanced_metrics.csv", seasonId)).map(
    (r) => PlayerAdvancedMetricsSchema.parse(r),
  );
}

export function getAdvancedMetricsFor(
  seasonId: SeasonId,
  player: string,
): PlayerAdvancedMetrics | null {
  return (
    getAdvancedMetrics(seasonId).find((m) => m.player === player) ?? null
  );
}

export function getScoutingReports(seasonId: SeasonId): ScoutingReport[] {
  return parseCSV(dataFilePath("scouting_reports.csv", seasonId)).map((r) =>
    ScoutingReportSchema.parse(r),
  );
}

export function getScoutingReportFor(
  seasonId: SeasonId,
  a: string,
  b: string,
): ScoutingReport | null {
  const [pa, pb] = [a, b].sort();
  return (
    getScoutingReports(seasonId).find(
      (r) => r.player_a === pa && r.player_b === pb,
    ) ?? null
  );
}

export function getDraftPositionOutcomes(
  seasonId: SeasonId,
): DraftPositionOutcome[] {
  return parseCSV(dataFilePath("draft_position_outcomes.csv", seasonId)).map(
    (r) => DraftPositionOutcomeSchema.parse(r),
  );
}
