import type {
  ClutchFactor,
  PlayerMapAffinity,
  SpiritCivMatchup,
  UpsetProbability,
} from "@/lib/types";
import {
  ClutchFactorSchema,
  PlayerMapAffinitySchema,
  SpiritCivMatchupSchema,
  UpsetProbabilitySchema,
} from "@/lib/schemas";
import type { SeasonId } from "@/lib/season-types";
import { parseCSV } from "./csv";
import { spiritDataPath } from "./paths";

export function getClutchFactors(seasonId: SeasonId): ClutchFactor[] {
  return parseCSV(spiritDataPath("clutch_factor.csv", seasonId)).map((r) =>
    ClutchFactorSchema.parse(r),
  );
}

export function getPlayerMapAffinities(
  seasonId: SeasonId,
): PlayerMapAffinity[] {
  return parseCSV(spiritDataPath("player_map_affinity.csv", seasonId)).map(
    (r) => PlayerMapAffinitySchema.parse(r),
  );
}

export function getPlayerMapAffinityFor(
  seasonId: SeasonId,
  player: string,
): PlayerMapAffinity[] {
  return getPlayerMapAffinities(seasonId).filter((a) => a.player === player);
}

export function getSpiritCivMatchups(seasonId: SeasonId): SpiritCivMatchup[] {
  return parseCSV(spiritDataPath("civ_matchup_matrix.csv", seasonId)).map(
    (r) => SpiritCivMatchupSchema.parse(r),
  );
}

export function getUpsetProbabilities(seasonId: SeasonId): UpsetProbability[] {
  return parseCSV(
    spiritDataPath("upset_probability_by_elo_bin.csv", seasonId),
  ).map((r) => UpsetProbabilitySchema.parse(r));
}
