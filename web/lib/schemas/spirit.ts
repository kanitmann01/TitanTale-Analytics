import { z } from "zod";

export const ClutchFactorSchema = z.object({
  player: z.coerce.string(),
  overall_wr: z.coerce.number(),
  clutch_wr: z.coerce.number(),
  clutch_n: z.coerce.number(),
  delta: z.coerce.number(),
  p_value: z.coerce.number(),
});

export const PlayerMapAffinitySchema = z.object({
  player: z.coerce.string(),
  map: z.coerce.string(),
  map_wr: z.coerce.number(),
  overall_wr: z.coerce.number(),
  delta: z.coerce.number(),
  map_n: z.coerce.number(),
  p_value: z.coerce.number(),
});

export const SpiritCivMatchupSchema = z.object({
  civ_a: z.coerce.string(),
  civ_b: z.coerce.string(),
  civ_a_wins: z.coerce.number(),
  total: z.coerce.number(),
  win_rate: z.coerce.number(),
  p_value: z.coerce.number(),
});

export const UpsetProbabilitySchema = z.object({
  elo_bin: z.coerce.string(),
  n: z.coerce.number(),
  actual_fav_wr: z.coerce.number(),
  expected_fav_wr: z.coerce.number(),
  actual_upset_rate: z.coerce.number(),
  expected_upset_rate: z.coerce.number(),
  volatility_factor: z.coerce.number(),
});

/** One row from spirit_of_the_law_analysis.py findings.json (machine layer). */
export const SpiritFindingsInvestigationSchema = z.object({
  id: z.number().int().positive(),
  slug: z.string(),
  title: z.string(),
  hypothesis: z.string(),
  method: z.string(),
  finding: z.string(),
  p_value: z.number().nullable().optional(),
  verdict: z.enum(["CONFIRMED", "BUSTED", "INCONCLUSIVE"]),
  viz_path: z.string().nullable().optional(),
  test_name: z.string().nullable().optional(),
  n: z.number().nullable().optional(),
  ci_low: z.number().nullable().optional(),
  ci_high: z.number().nullable().optional(),
  effect_size: z.string(),
  statistical_weight: z.string(),
  n_significant: z.number().int().optional(),
  multiple_testing_note: z.string().optional(),
});

export const SpiritFindingsFileSchema = z.object({
  season_id: z.string(),
  generated_at: z.string(),
  investigations: z.array(SpiritFindingsInvestigationSchema),
});

export type SpiritFindingsInvestigation = z.infer<
  typeof SpiritFindingsInvestigationSchema
>;
export type SpiritFindingsFile = z.infer<typeof SpiritFindingsFileSchema>;
