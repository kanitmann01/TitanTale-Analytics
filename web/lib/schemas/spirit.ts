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
