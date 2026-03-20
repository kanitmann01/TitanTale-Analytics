import { z } from "zod";

export const CivMatchupSchema = z.object({
  civilization1: z.string().min(1),
  civilization2: z.string().min(1),
  games_played: z.number(),
  civ1_wins: z.number(),
  civ2_wins: z.number(),
  civ1_win_rate: z.number(),
  avg_duration: z.number(),
});

export type CivMatchupRow = z.infer<typeof CivMatchupSchema>;
