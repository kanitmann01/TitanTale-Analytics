"use client";

import { useEffect, useMemo, useState } from "react";
import StatHelp from "@/components/StatHelp";
import { STAT_HELP, helpAria } from "@/lib/stat-tooltips";

export type FindingVerdict = "CONFIRMED" | "BUSTED" | "INCONCLUSIVE";

/** Spirit investigation catalog order (I-X). */
const DOCKET_ROMAN = [
  "",
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
] as const;

export function spiritDocketRoman(id: number): string {
  return DOCKET_ROMAN[id] ?? `#${id}`;
}

export interface ResearchFinding {
  id: number;
  title: string;
  hypothesis: string;
  method: string;
  /** Primary empirical result. */
  finding: string;
  /** Effect size line (Investigative Summary Matrix column). */
  effectSize: string;
  /** Statistical weight / p-value phrasing from the brief. */
  statisticalWeight: string;
  verdict: FindingVerdict;
  confidence: number;
  evidenceLevel: "High" | "Medium" | "Low";
  practicalImpact: "High" | "Medium" | "Low";
  action: string;
  /** Why it matters / interpretation (brief sections 12.x). */
  interpretation?: string;
  /** Repo-relative path to Spirit PNG (e.g. assets/spirit/foo.png). */
  visualization?: string;
  caveat?: string;
  /** Plain-English reasons the pattern might appear (speculation, not new tests). */
  mechanisms?: string[];
  /** Community-style myth for Myth vs record cards (optional). */
  mythHeadline?: string;
  /** From findings.json: formal test label (e.g. Fisher exact). */
  testName?: string;
  /** Primary n reported by the Spirit script (games, players, cells, etc.). */
  sampleN?: number;
  /** Wilson 95% interval for a key proportion when the pipeline computed it. */
  ciLow?: number;
  ciHigh?: number;
  /** Pipeline note when many implicit tests were run (clutch, map grid, civ pairs). */
  multipleTestingNote?: string;
}

const VERDICT_STYLE: Record<FindingVerdict, string> = {
  CONFIRMED: "bg-ttl-win/10 text-ttl-win border-ttl-win/30",
  BUSTED: "bg-ttl-loss/10 text-ttl-loss border-ttl-loss/30",
  INCONCLUSIVE: "bg-ttl-accent/10 text-ttl-accent border-ttl-accent/30",
};

function verdictFilterLabel(v: "ALL" | FindingVerdict): string {
  switch (v) {
    case "ALL":
      return "All";
    case "CONFIRMED":
      return "Confirmed";
    case "BUSTED":
      return "Busted";
    case "INCONCLUSIVE":
      return "Inconclusive";
  }
}

export default function ResearchFindingsExplorer({
  findings,
}: {
  findings: ResearchFinding[];
}) {
  const [query, setQuery] = useState<string>("");
  const [verdictFilter, setVerdictFilter] = useState<"ALL" | FindingVerdict>("ALL");
  const [conclusiveMode, setConclusiveMode] = useState<boolean>(true);
  const [expandedId, setExpandedId] = useState<number | null>(findings[0]?.id ?? null);

  useEffect(() => {
    function syncFromHash(): void {
      const m = window.location.hash.match(/^#spirit-finding-(\d+)$/);
      if (m) {
        const num = Number(m[1]);
        if (findings.some((f) => f.id === num)) {
          setExpandedId(num);
        }
      }
    }
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [findings]);

  const filtered = useMemo(() => {
    return findings
      .filter((f) => (verdictFilter === "ALL" ? true : f.verdict === verdictFilter))
      .filter((f) => {
        if (!conclusiveMode) return true;
        return f.confidence >= 75 && f.practicalImpact !== "Low";
      })
      .filter((f) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
          f.title.toLowerCase().includes(q) ||
          f.finding.toLowerCase().includes(q) ||
          f.hypothesis.toLowerCase().includes(q) ||
          f.effectSize.toLowerCase().includes(q) ||
          f.statisticalWeight.toLowerCase().includes(q) ||
          (f.interpretation?.toLowerCase().includes(q) ?? false) ||
          (f.mythHeadline?.toLowerCase().includes(q) ?? false) ||
          (f.mechanisms?.some((m) => m.toLowerCase().includes(q)) ?? false) ||
          (f.testName?.toLowerCase().includes(q) ?? false) ||
          (f.multipleTestingNote?.toLowerCase().includes(q) ?? false)
        );
      })
      .sort((a, b) => b.confidence - a.confidence);
  }, [findings, verdictFilter, conclusiveMode, query]);

  const topConclusions = useMemo(() => {
    return findings
      .filter((f) => f.verdict === "CONFIRMED" && f.confidence >= 80)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  }, [findings]);

  return (
    <section className="anim-fade-up">
      <h2 className="section-label mb-4 flex flex-wrap items-center gap-1">
        Findings explorer
        <StatHelp
          text={STAT_HELP.researchExplorerIntro}
          ariaLabel={helpAria("Findings explorer")}
        />
      </h2>

      <div className="panel mb-5">
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_auto_auto] lg:gap-3 lg:items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, hypothesis, or finding..."
            aria-label="Search research findings"
            className="select-interactive min-h-11 w-full rounded border border-ttl-border bg-ttl-surface px-3 text-fluid-base sm:text-fluid-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ttl-accent/40 focus:border-ttl-accent/45"
          />

          <div className="flex flex-wrap items-center gap-2">
            {(["ALL", "CONFIRMED", "BUSTED", "INCONCLUSIVE"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVerdictFilter(v)}
                className={`btn-press text-fluid-sm sm:text-fluid-xs min-h-11 sm:min-h-0 px-3 sm:px-2.5 py-2 sm:py-1 rounded border transition-[border-color,background-color,color] duration-200 ease-out ${
                  verdictFilter === v
                    ? "border-ttl-gold/40 text-ttl-gold bg-ttl-gold/10"
                    : "border-ttl-border-subtle text-muted hover:text-secondary hover:border-ttl-accent/25"
                }`}
              >
                {verdictFilterLabel(v)}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
            <button
              type="button"
              aria-pressed={conclusiveMode}
              onClick={() => setConclusiveMode((s) => !s)}
              className={`btn-press w-full lg:w-auto min-h-11 lg:min-h-10 h-auto lg:h-10 px-3 rounded border text-fluid-xs font-bold uppercase tracking-wider leading-snug py-2.5 lg:py-0 transition-[border-color,background-color,color] duration-200 ease-out ${
                conclusiveMode
                  ? "border-ttl-win/40 text-ttl-win bg-ttl-win/10"
                  : "border-ttl-border-subtle text-muted hover:border-ttl-accent/25 hover:text-secondary"
              }`}
            >
              {conclusiveMode
                ? "Strong findings only"
                : "Include exploratory findings"}
            </button>
            <StatHelp
              text={STAT_HELP.researchStrongFilter}
              ariaLabel={helpAria("Strong findings filter")}
              align="end"
            />
          </div>
        </div>
        <p className="text-fluid-xs text-muted mt-3">
          When on, findings below 75% confidence or with low practical impact
          are hidden. Turn off to browse the full set.
        </p>
      </div>

      <div className="mb-10 rounded-lg border border-ttl-border-subtle/80 bg-ttl-raised/20 px-4 py-4 sm:px-5 sm:py-5">
        <h3 className="section-label mb-4 flex flex-wrap items-center gap-1">
          Most actionable conclusions
          <StatHelp
            text={STAT_HELP.researchMostActionable}
            ariaLabel={helpAria("Most Actionable Conclusions")}
          />
        </h3>
        <ul className="space-y-0 divide-y divide-ttl-border-subtle/45">
          {topConclusions.map((f) => (
            <li key={f.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <p className="text-fluid-sm text-primary font-medium font-display leading-snug">
                  {f.title}
                </p>
                <span className="text-fluid-xs text-ttl-win font-bold tabular-nums shrink-0">
                  {f.confidence}%
                </span>
              </div>
              <p className="text-fluid-xs text-secondary mt-1.5 leading-relaxed max-w-prose">
                {f.action}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        {filtered.map((f) => {
          const expanded = expandedId === f.id;
          return (
            <article
              key={f.id}
              id={`spirit-finding-${f.id}`}
              className="panel border border-ttl-border-subtle/60 transition-[border-color,box-shadow] duration-200 ease-out hover:border-ttl-gold/20 scroll-mt-24"
            >
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : f.id)}
                className="btn-press w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ttl-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-ttl-raised rounded-sm"
              >
                <div className="flex flex-wrap items-start gap-3">
                  <span
                    className="text-fluid-xs text-ttl-gold/90 font-display font-bold tracking-widest shrink-0"
                    title="Investigation docket"
                  >
                    {spiritDocketRoman(f.id)}
                  </span>
                  <h3 className="font-display text-fluid-lg font-bold text-primary flex-1">
                    {f.title}
                  </h3>
                  <span
                    className={`text-fluid-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${VERDICT_STYLE[f.verdict]}`}
                  >
                    {f.verdict}
                  </span>
                </div>
                {!expanded && (
                  <p className="text-fluid-sm text-secondary mt-3 leading-relaxed line-clamp-2">
                    {f.finding}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-fluid-xs">
                  <span className="text-muted inline-flex items-center gap-1 flex-wrap">
                    Effect:
                    <StatHelp
                      text={STAT_HELP.researchEffect}
                      ariaLabel={helpAria("Effect")}
                    />
                    <span className="text-primary font-medium">{f.effectSize}</span>
                  </span>
                  <span className="text-muted inline-flex items-center gap-1 flex-wrap">
                    Statistical weight:
                    <StatHelp
                      text={STAT_HELP.researchStatisticalWeight}
                      ariaLabel={helpAria("Statistical weight")}
                    />
                    <span className="text-primary font-medium">{f.statisticalWeight}</span>
                  </span>
                  <span className="text-muted inline-flex items-center gap-1 flex-wrap">
                    Confidence:
                    <StatHelp
                      text={STAT_HELP.researchConfidence}
                      ariaLabel={helpAria("Confidence")}
                    />
                    <span className="text-primary font-medium">{f.confidence}%</span>
                  </span>
                  <span className="text-muted inline-flex items-center gap-1 flex-wrap">
                    Evidence:
                    <StatHelp
                      text={STAT_HELP.researchEvidence}
                      ariaLabel={helpAria("Evidence")}
                    />
                    <span className="text-primary font-medium">{f.evidenceLevel}</span>
                  </span>
                  <span className="text-muted inline-flex items-center gap-1 flex-wrap">
                    Impact:
                    <StatHelp
                      text={STAT_HELP.researchImpact}
                      ariaLabel={helpAria("Impact")}
                    />
                    <span className="text-primary font-medium">{f.practicalImpact}</span>
                  </span>
                </div>
              </button>

              {expanded && (
                <div className="mt-4 pt-4 border-t border-ttl-border-subtle space-y-3">
                  <div>
                    <p className="text-fluid-xs text-muted uppercase tracking-wider mb-1">
                      Hypothesis
                    </p>
                    <p className="text-fluid-sm text-secondary leading-relaxed">{f.hypothesis}</p>
                  </div>
                  <div>
                    <p className="text-fluid-xs text-muted uppercase tracking-wider mb-1">
                      Method
                    </p>
                    <p className="text-fluid-sm text-secondary leading-relaxed">{f.method}</p>
                  </div>
                  <div>
                    <p className="text-fluid-xs text-muted uppercase tracking-wider mb-1">
                      Main result
                    </p>
                    <p className="text-fluid-sm text-primary font-medium leading-relaxed">{f.finding}</p>
                  </div>
                  {(f.testName != null && f.testName !== "") ||
                  f.sampleN != null ? (
                    <div>
                      <p className="text-fluid-xs text-muted uppercase tracking-wider mb-1 inline-flex items-center gap-1">
                        Test detail
                        <StatHelp
                          text={STAT_HELP.researchTestFamily}
                          ariaLabel={helpAria("Test detail")}
                        />
                      </p>
                      <p className="text-fluid-sm text-secondary leading-relaxed">
                        {[f.testName?.trim(), f.sampleN != null ? `(n = ${f.sampleN})` : ""]
                          .filter((s) => s && String(s).length > 0)
                          .join(" ")}
                      </p>
                    </div>
                  ) : null}
                  {f.ciLow != null && f.ciHigh != null ? (
                    <div>
                      <p className="text-fluid-xs text-muted uppercase tracking-wider mb-1 inline-flex items-center gap-1">
                        95% Wilson interval (key proportion)
                        <StatHelp
                          text={STAT_HELP.researchWilsonCi}
                          ariaLabel={helpAria("Wilson interval")}
                        />
                      </p>
                      <p className="text-fluid-sm text-secondary font-mono leading-relaxed">
                        {(f.ciLow * 100).toFixed(1)}% – {(f.ciHigh * 100).toFixed(1)}%
                      </p>
                    </div>
                  ) : null}
                  {f.multipleTestingNote ? (
                    <p className="callout text-fluid-xs text-secondary">
                      <span className="text-primary font-medium">
                        Multiple tests:{" "}
                      </span>
                      {f.multipleTestingNote}
                    </p>
                  ) : null}
                  {f.interpretation && (
                    <div>
                      <p className="text-fluid-xs text-muted uppercase tracking-wider mb-1">
                        Why it matters
                      </p>
                      <p className="text-fluid-sm text-secondary leading-relaxed">{f.interpretation}</p>
                    </div>
                  )}
                  {f.mechanisms && f.mechanisms.length > 0 && (
                    <div>
                      <p className="text-fluid-xs text-muted uppercase tracking-wider mb-2">
                        Why this pattern might appear
                      </p>
                      <ul className="list-disc pl-5 space-y-1.5 text-fluid-sm text-muted leading-relaxed">
                        {f.mechanisms.map((line, mi) => (
                          <li key={mi}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div>
                    <p className="text-fluid-xs text-muted uppercase tracking-wider mb-1">
                      Recommended action
                    </p>
                    <p className="text-fluid-sm text-secondary leading-relaxed">{f.action}</p>
                  </div>
                  {f.visualization && (
                    <p className="text-fluid-xs text-muted font-mono">
                      Visualization: {f.visualization}
                    </p>
                  )}
                  {f.caveat && (
                    <p className="callout text-fluid-xs text-secondary">{f.caveat}</p>
                  )}
                </div>
              )}
            </article>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-lg border border-dashed border-ttl-border-subtle px-4 py-8 text-center">
            <p className="text-fluid-sm text-secondary max-w-md mx-auto leading-relaxed">
              Nothing matches. Try a shorter search, set verdict to{" "}
              <span className="text-primary font-medium">All</span>, or turn on{" "}
              <span className="text-primary font-medium">
                Include exploratory findings
              </span>{" "}
              to show lower-confidence rows.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
