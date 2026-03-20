import path from "path";
import fs from "fs";
import type { SeasonId } from "@/lib/season-types";
import { DEFAULT_SEASON_ID, isValidSeasonId } from "@/lib/season-types";

function resolveDataDir(): string {
  if (process.env.DATA_DIR) {
    return process.env.DATA_DIR;
  }

  const projectRoot = path.resolve(process.cwd(), "..");
  const projectDataDir = path.join(projectRoot, "data");
  if (fs.existsSync(projectDataDir)) {
    return projectDataDir;
  }

  const standaloneDataDir = path.join(process.cwd(), "data");
  if (fs.existsSync(standaloneDataDir)) {
    return standaloneDataDir;
  }

  return projectDataDir;
}

const DATA_DIR = resolveDataDir();

function uniqueExisting(pathsToTry: string[]): string | null {
  const seen = new Set<string>();
  for (const p of pathsToTry) {
    const norm = path.normalize(p);
    if (seen.has(norm)) {
      continue;
    }
    seen.add(norm);
    if (fs.existsSync(norm)) {
      return norm;
    }
  }
  return null;
}

/**
 * Resolve a data file for a season: prefer seasons/{id}/, then seasons/s5/, then repo data root.
 */
export function dataFilePath(filename: string, seasonId: SeasonId): string {
  const chain = [
    path.join(DATA_DIR, "seasons", seasonId, filename),
    path.join(DATA_DIR, "seasons", DEFAULT_SEASON_ID, filename),
    path.join(DATA_DIR, filename),
  ];
  const found = uniqueExisting(chain);
  if (!found) {
    throw new Error(
      `Data file not found for season ${seasonId}: ${filename} (tried ${chain.join(", ")})`,
    );
  }
  return found;
}

export function spiritDataPath(filename: string, seasonId: SeasonId): string {
  const chain = [
    path.join(DATA_DIR, "seasons", seasonId, "spirit", filename),
    path.join(DATA_DIR, "seasons", DEFAULT_SEASON_ID, "spirit", filename),
    path.join(DATA_DIR, "spirit", filename),
  ];
  const found = uniqueExisting(chain);
  if (!found) {
    throw new Error(
      `Spirit data file not found for season ${seasonId}: ${filename}`,
    );
  }
  return found;
}

export function getDataDir(): string {
  return DATA_DIR;
}

/** Latest mtime among core CSVs/JSON for "last updated" in footer. */
export function getCoreDataLastModifiedMs(seasonId: SeasonId): number {
  const names = [
    "ttl_s5_matches.csv",
    "player_statistics.csv",
    "tournament_info.json",
  ];
  let max = 0;
  for (const n of names) {
    try {
      const p = dataFilePath(n, seasonId);
      const st = fs.statSync(p);
      if (st.mtimeMs > max) {
        max = st.mtimeMs;
      }
    } catch {
      /* skip missing */
    }
  }
  return max;
}

/**
 * Season folders under data/seasons/{id}/ with tournament_info.json.
 * If none exist, default single season s5 (legacy root data/).
 */
export function listSeasonIdsOnDisk(): SeasonId[] {
  const seasonsRoot = path.join(DATA_DIR, "seasons");
  const ids: SeasonId[] = [];
  if (fs.existsSync(seasonsRoot)) {
    for (const name of fs.readdirSync(seasonsRoot)) {
      const sub = path.join(seasonsRoot, name);
      if (!fs.statSync(sub).isDirectory()) {
        continue;
      }
      if (!isValidSeasonId(name)) {
        continue;
      }
      const ti = path.join(sub, "tournament_info.json");
      if (fs.existsSync(ti)) {
        ids.push(name.toLowerCase());
      }
    }
  }
  const merged = new Set<SeasonId>([DEFAULT_SEASON_ID, ...ids]);
  const out = Array.from(merged);
  out.sort((a, b) => {
    const na = parseInt(a.replace(/^s/i, ""), 10);
    const nb = parseInt(b.replace(/^s/i, ""), 10);
    return na - nb;
  });
  return out;
}
