import { z } from "zod";

export const CivilizationStatsSchema = z.object({
  civilization: z.string().min(1),
  games_played: z.coerce.number(),
  wins: z.coerce.number(),
  losses: z.coerce.number(),
  win_rate: z.coerce.number(),
  pick_rate: z.coerce.number(),
  avg_duration: z.coerce.number(),
});

export type CivilizationStatsRow = z.infer<typeof CivilizationStatsSchema>;
