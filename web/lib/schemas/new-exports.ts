import { z } from "zod";

export const PlayerH2HSchema = z.object({
  player_a: z.coerce.string(),
  player_b: z.coerce.string(),
  series_winner: z.coerce.string(),
  a_game_wins: z.coerce.number(),
  b_game_wins: z.coerce.number(),
  total_games: z.coerce.number(),
  maps_played: z.coerce.string(),
  a_civs: z.coerce.string(),
  b_civs: z.coerce.string(),
  avg_duration: z.coerce.number(),
  elo_diff: z.coerce.number(),
});

export const PlayerAdvancedMetricsSchema = z.object({
  player: z.coerce.string(),
  elo: z.coerce.number(),
  win_rate: z.coerce.number(),
  total_games: z.coerce.number(),
  duration_cv: z.coerce.number(),
  position_bias: z.coerce.number(),
  p1_win_rate: z.coerce.number(),
  p2_win_rate: z.coerce.number(),
  civ_diversity: z.coerce.number(),
  unique_civs: z.coerce.number(),
  consistency: z.coerce.number().nullable(),
  expected_win_rate: z.coerce.number(),
  performance_residual: z.coerce.number(),
  performance_tier: z.coerce.string(),
});

export const ScoutingReportSchema = z.object({
  player_a: z.coerce.string(),
  player_b: z.coerce.string(),
  a_best_maps: z.coerce.string(),
  b_best_maps: z.coerce.string(),
  contested_maps: z.coerce.string(),
  a_weak_maps: z.coerce.string(),
  a_signature_civs: z.coerce.string(),
  b_signature_civs: z.coerce.string(),
  civ_overlap: z.coerce.string(),
  elo_edge: z.coerce.string(),
  upset_probability: z.coerce.number(),
});

export const DraftPositionOutcomeSchema = z.object({
  draft_position: z.coerce.number(),
  total_picks: z.coerce.number(),
  unique_civs: z.coerce.number(),
  top_civs: z.coerce.string(),
  top_maps: z.coerce.string(),
});
