import { z } from "zod";

export const TTLMatchSchema = z.object({
  match_id: z.coerce.number(),
  game_number: z.coerce.number(),
  player1: z.string().min(1),
  player2: z.string().min(1),
  winner: z.string().min(1),
  loser: z.string().min(1),
  player1_civ: z.string().min(1),
  player2_civ: z.string().min(1),
  map: z.string().min(1),
  duration_minutes: z.coerce.number(),
  stage: z.string().min(1),
  player1_elo: z.coerce.number(),
  player2_elo: z.coerce.number(),
});

export type TTLMatchRow = z.infer<typeof TTLMatchSchema>;
