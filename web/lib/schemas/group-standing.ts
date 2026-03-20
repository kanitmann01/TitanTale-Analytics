import { z } from "zod";

export const GroupStandingSchema = z.object({
  league: z.string().min(1),
  group: z.string().min(1),
  player: z.string().min(1),
  standings_snapshot: z.string(),
});

export type GroupStandingRow = z.infer<typeof GroupStandingSchema>;
