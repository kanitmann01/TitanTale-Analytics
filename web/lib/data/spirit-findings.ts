import fs from "fs";

import type { ResearchFinding } from "@/components/research/ResearchFindingsExplorer";
import type { SeasonId } from "@/lib/season-types";
import {
  SpiritFindingsFileSchema,
  type SpiritFindingsInvestigation,
} from "@/lib/schemas/spirit";

import { RESEARCH_FINDINGS_FALLBACK } from "./spirit-findings-fallback";
import { trySpiritDataPath } from "./paths";

/** Must match spirit_of_the_law_analysis.SPIRIT_SLUGS order (investigation I-X). */
export const SPIRIT_SLUG_ORDER: readonly string[] = [
  "snowball",
  "positional_advantage",
  "fatigue",
  "comfort_vs_wildcard",
  "clutch",
  "civ_matchups",
  "map_specialists",
  "upset_probability",
  "tempo",
  "meta_evolution",
] as const;

function mergeMachineWithEditorial(
  machine: SpiritFindingsInvestigation,
  index: number,
): ResearchFinding {
  const ed = RESEARCH_FINDINGS_FALLBACK[index];
  if (!ed || ed.id !== machine.id) {
    throw new Error(
      `Spirit findings.json id mismatch at index ${index}: expected fallback id ${ed?.id}, got ${machine.id}`,
    );
  }
  const expectedSlug = SPIRIT_SLUG_ORDER[index];
  if (expectedSlug && machine.slug !== expectedSlug) {
    console.warn(
      `[spirit-findings] slug mismatch for id ${machine.id}: json="${machine.slug}" expected="${expectedSlug}"`,
    );
  }
  const ciLow =
    machine.ci_low != null && !Number.isNaN(machine.ci_low)
      ? machine.ci_low
      : undefined;
  const ciHigh =
    machine.ci_high != null && !Number.isNaN(machine.ci_high)
      ? machine.ci_high
      : undefined;
  return {
    id: machine.id,
    title: machine.title,
    hypothesis: machine.hypothesis,
    method: machine.method,
    finding: machine.finding,
    effectSize: machine.effect_size,
    statisticalWeight: machine.statistical_weight,
    verdict: machine.verdict,
    visualization: machine.viz_path ?? undefined,
    confidence: ed.confidence,
    evidenceLevel: ed.evidenceLevel,
    practicalImpact: ed.practicalImpact,
    action: ed.action,
    interpretation: ed.interpretation,
    caveat: ed.caveat,
    mechanisms: ed.mechanisms,
    mythHeadline: ed.mythHeadline,
    testName: machine.test_name ?? undefined,
    sampleN: machine.n ?? undefined,
    ciLow,
    ciHigh,
    multipleTestingNote: machine.multiple_testing_note ?? undefined,
  };
}

/**
 * Research explorer cards: machine fields from findings.json when present,
 * otherwise static fallback. Editorial fields always from fallback template.
 */
export function getSpiritFindings(seasonId: SeasonId): ResearchFinding[] {
  const jsonPath = trySpiritDataPath("findings.json", seasonId);
  if (!jsonPath) {
    return RESEARCH_FINDINGS_FALLBACK;
  }
  try {
    const raw: unknown = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    const data = SpiritFindingsFileSchema.parse(raw);
    const sorted = [...data.investigations].sort((a, b) => a.id - b.id);
    if (sorted.length !== RESEARCH_FINDINGS_FALLBACK.length) {
      console.warn(
        `[spirit-findings] findings.json has ${sorted.length} investigations; expected ${RESEARCH_FINDINGS_FALLBACK.length}. Using fallback.`,
      );
      return RESEARCH_FINDINGS_FALLBACK;
    }
    return sorted.map((inv, i) => mergeMachineWithEditorial(inv, i));
  } catch (e) {
    console.warn("[spirit-findings] failed to parse findings.json:", e);
    return RESEARCH_FINDINGS_FALLBACK;
  }
}
