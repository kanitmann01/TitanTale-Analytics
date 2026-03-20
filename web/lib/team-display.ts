const PLACEHOLDERS = new Set(
  ["team name", "tbd", "n/a", "unknown", ""].map((s) => s.toLowerCase()),
);

export function displayTeamName(raw: string | null | undefined): string | null {
  if (raw == null || raw.trim() === "") {
    return null;
  }
  if (PLACEHOLDERS.has(raw.trim().toLowerCase())) {
    return null;
  }
  return raw.trim();
}
