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
import { parseCSV } from "./csv";
import { dataFilePath } from "./paths";

export function getPlayerH2H(): PlayerH2H[] {
  return parseCSV(dataFilePath("player_h2h.csv")).map((r) =>
    PlayerH2HSchema.parse(r),
  );
}

export function getPlayerH2HFor(player: string): PlayerH2H[] {
  return getPlayerH2H().filter(
    (h) => h.player_a === player || h.player_b === player,
  );
}

export function getPlayerH2HPair(a: string, b: string): PlayerH2H | null {
  const [pa, pb] = [a, b].sort();
  return getPlayerH2H().find(
    (h) => h.player_a === pa && h.player_b === pb,
  ) ?? null;
}

export function getAdvancedMetrics(): PlayerAdvancedMetrics[] {
  return parseCSV(dataFilePath("player_advanced_metrics.csv")).map((r) =>
    PlayerAdvancedMetricsSchema.parse(r),
  );
}

export function getAdvancedMetricsFor(
  player: string,
): PlayerAdvancedMetrics | null {
  return getAdvancedMetrics().find((m) => m.player === player) ?? null;
}

export function getScoutingReports(): ScoutingReport[] {
  return parseCSV(dataFilePath("scouting_reports.csv")).map((r) =>
    ScoutingReportSchema.parse(r),
  );
}

export function getScoutingReportFor(
  a: string,
  b: string,
): ScoutingReport | null {
  const [pa, pb] = [a, b].sort();
  return getScoutingReports().find(
    (r) => r.player_a === pa && r.player_b === pb,
  ) ?? null;
}

export function getDraftPositionOutcomes(): DraftPositionOutcome[] {
  return parseCSV(dataFilePath("draft_position_outcomes.csv")).map((r) =>
    DraftPositionOutcomeSchema.parse(r),
  );
}
