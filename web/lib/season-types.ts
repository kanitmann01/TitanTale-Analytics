/** URL/cookie slug, e.g. s5 */
export type SeasonId = string;

export const DEFAULT_SEASON_ID: SeasonId = "s5";

const SEASON_ID_RE = /^s[1-9]\d*$/i;

export function isValidSeasonId(
  value: string | undefined | null,
): value is SeasonId {
  return typeof value === "string" && SEASON_ID_RE.test(value);
}

export function parseSeasonId(value: string | undefined | null): SeasonId {
  if (isValidSeasonId(value)) {
    return value.toLowerCase();
  }
  return DEFAULT_SEASON_ID;
}

export function seasonSlugToDefaultLabel(seasonId: SeasonId): string {
  const n = seasonId.replace(/^s/i, "");
  return `T90 Season ${n}`;
}
