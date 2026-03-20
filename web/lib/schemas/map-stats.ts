import { z } from "zod";

export const MapStatsSchema = z.object({
  map: z.string().min(1),
  total_games: z.coerce.number(),
  avg_duration: z.coerce.number(),
  most_common_civ: z.string().min(1),
  balance_std: z.coerce.number(),
});

export type MapStatsRow = z.infer<typeof MapStatsSchema>;
