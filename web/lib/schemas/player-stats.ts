import { z } from "zod";

export const PlayerStatsSchema = z.object({
  player: z.string().min(1),
  total_games: z.coerce.number(),
  wins: z.coerce.number(),
  losses: z.coerce.number(),
  win_rate: z.coerce.number(),
  elo: z.coerce.number().nullable(),
  avg_game_duration: z.coerce.number(),
  unique_civs: z.coerce.number(),
  unique_maps: z.coerce.number(),
});

export type PlayerStatsRow = z.infer<typeof PlayerStatsSchema>;
