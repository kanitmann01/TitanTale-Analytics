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
import { parseCSV } from "./csv";
import path from "path";
import fs from "fs";

const SPIRIT_DIR = path.resolve(process.cwd(), "..", "data", "spirit");

function spiritPath(filename: string): string {
  const full = path.join(SPIRIT_DIR, filename);
  if (!fs.existsSync(full)) {
    throw new Error(`Spirit data file not found: ${full}`);
  }
  return full;
}

export function getClutchFactors(): ClutchFactor[] {
  return parseCSV(spiritPath("clutch_factor.csv")).map((r) =>
    ClutchFactorSchema.parse(r),
  );
}

export function getPlayerMapAffinities(): PlayerMapAffinity[] {
  return parseCSV(spiritPath("player_map_affinity.csv")).map((r) =>
    PlayerMapAffinitySchema.parse(r),
  );
}

export function getPlayerMapAffinityFor(player: string): PlayerMapAffinity[] {
  return getPlayerMapAffinities().filter((a) => a.player === player);
}

export function getSpiritCivMatchups(): SpiritCivMatchup[] {
  return parseCSV(spiritPath("civ_matchup_matrix.csv")).map((r) =>
    SpiritCivMatchupSchema.parse(r),
  );
}

export function getUpsetProbabilities(): UpsetProbability[] {
  return parseCSV(spiritPath("upset_probability_by_elo_bin.csv")).map((r) =>
    UpsetProbabilitySchema.parse(r),
  );
}
