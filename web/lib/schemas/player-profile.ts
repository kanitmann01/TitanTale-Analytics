import { z } from "zod";

export const PlayerMatchHistorySchema = z.object({
  match_id: z.number(),
  game_number: z.number(),
  opponent: z.string().min(1),
  player_civ: z.string().min(1),
  opponent_civ: z.string().min(1),
  map: z.string().min(1),
  duration_minutes: z.number(),
  result: z.enum(['win', 'loss']),
  stage: z.string().min(1),
  player_elo: z.number(),
  opponent_elo: z.number(),
});

export const PlayerCivPreferenceSchema = z.object({
  civilization: z.string().min(1),
  games_played: z.number(),
  wins: z.number(),
  losses: z.number(),
  win_rate: z.number(),
});

export const PlayerProfileSchema = z.object({
  player_name: z.string().min(1),
  total_games: z.number(),
  wins: z.number(),
  losses: z.number(),
  win_rate: z.number(),
  elo: z.number().nullable(),
  avg_game_duration: z.number(),
  unique_civs: z.number(),
  unique_maps: z.number(),
  match_history: z.array(PlayerMatchHistorySchema),
  civ_preferences: z.array(PlayerCivPreferenceSchema),
});

export type PlayerMatchHistoryRow = z.infer<typeof PlayerMatchHistorySchema>;
export type PlayerCivPreferenceRow = z.infer<typeof PlayerCivPreferenceSchema>;
export type PlayerProfileRow = z.infer<typeof PlayerProfileSchema>;
