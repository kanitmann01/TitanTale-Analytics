import { z } from "zod";

export const MapCivPopularitySchema = z.object({
  civilization: z.string().min(1),
  games_played: z.number(),
  pick_rate: z.number(),
  win_rate: z.number(),
});

export const MapDurationTrendSchema = z.object({
  duration_bucket: z.string().min(1),
  games_count: z.number(),
  avg_duration: z.number(),
});

export const MapBreakdownSchema = z.object({
  map: z.string().min(1),
  total_games: z.number(),
  avg_duration: z.number(),
  most_common_civ: z.string().min(1),
  balance_std: z.number(),
  civ_popularity: z.array(MapCivPopularitySchema),
  duration_trends: z.array(MapDurationTrendSchema),
});

export type MapCivPopularityRow = z.infer<typeof MapCivPopularitySchema>;
export type MapDurationTrendRow = z.infer<typeof MapDurationTrendSchema>;
export type MapBreakdownRow = z.infer<typeof MapBreakdownSchema>;
