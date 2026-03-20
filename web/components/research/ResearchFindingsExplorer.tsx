"use client";

import { useMemo, useState } from "react";

export type FindingVerdict = "CONFIRMED" | "BUSTED" | "INCONCLUSIVE";

export interface ResearchFinding {
  id: number;
  title: string;
  hypothesis: string;
  method: string;
  finding: string;
  pValue: string;
  verdict: FindingVerdict;
  confidence: number;
  evidenceLevel: "High" | "Medium" | "Low";
  practicalImpact: "High" | "Medium" | "Low";
  action: string;
  caveat?: string;
}

const VERDICT_STYLE: Record<FindingVerdict, string> = {
  CONFIRMED: "bg-ttl-win/10 text-ttl-win border-ttl-win/30",
  BUSTED: "bg-ttl-loss/10 text-ttl-loss border-ttl-loss/30",
  INCONCLUSIVE: "bg-ttl-accent/10 text-ttl-accent border-ttl-accent/30",
};

export default function ResearchFindingsExplorer({
  findings,
}: {
  findings: ResearchFinding[];
}) {
  const [query, setQuery] = useState<string>("");
  const [verdictFilter, setVerdictFilter] = useState<"ALL" | FindingVerdict>("ALL");
  const [conclusiveMode, setConclusiveMode] = useState<boolean>(true);
  const [expandedId, setExpandedId] = useState<number | null>(findings[0]?.id ?? null);

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
          f.hypothesis.toLowerCase().includes(q)
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
      <h2 className="section-label mb-4">Interactive Findings Explorer</h2>

      <div className="panel mb-5">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-3 items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search findings, hypotheses, or outcomes..."
            className="h-10 rounded border border-ttl-border bg-ttl-surface px-3 text-fluid-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ttl-accent/30"
          />

          <div className="flex items-center gap-2">
            {(["ALL", "CONFIRMED", "BUSTED", "INCONCLUSIVE"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVerdictFilter(v)}
                className={`text-fluid-xs px-2.5 py-1 rounded border transition-colors ${
                  verdictFilter === v
                    ? "border-ttl-gold/40 text-ttl-gold bg-ttl-gold/10"
                    : "border-ttl-border-subtle text-muted hover:text-secondary"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setConclusiveMode((s) => !s)}
            className={`h-10 px-3 rounded border text-fluid-xs font-bold uppercase tracking-wider transition-colors ${
              conclusiveMode
                ? "border-ttl-win/40 text-ttl-win bg-ttl-win/10"
                : "border-ttl-border-subtle text-muted"
            }`}
          >
            {conclusiveMode ? "Conclusive mode: ON" : "Conclusive mode: OFF"}
          </button>
        </div>
        <p className="text-fluid-xs text-muted mt-3">
          Conclusive mode shows high-confidence and high-impact findings first.
        </p>
      </div>

      <div className="panel mb-8">
        <h3 className="section-label mb-3">Most Actionable Conclusions</h3>
        <div className="space-y-2">
          {topConclusions.map((f) => (
            <div key={f.id} className="panel-inset">
              <div className="flex items-start justify-between gap-2">
                <p className="text-fluid-sm text-primary font-medium">
                  {f.title}
                </p>
                <span className="text-fluid-xs text-ttl-win font-bold">
                  {f.confidence}% confidence
                </span>
              </div>
              <p className="text-fluid-xs text-secondary mt-1">{f.action}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((f) => {
          const expanded = expandedId === f.id;
          return (
            <article key={f.id} className="panel">
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : f.id)}
                className="w-full text-left"
              >
                <div className="flex flex-wrap items-start gap-3">
                  <span className="text-fluid-xs text-muted font-mono">#{f.id}</span>
                  <h3 className="font-display text-fluid-lg font-bold text-primary flex-1">
                    {f.title}
                  </h3>
                  <span
                    className={`text-fluid-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${VERDICT_STYLE[f.verdict]}`}
                  >
                    {f.verdict}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-fluid-xs">
                  <span className="text-muted">
                    Confidence: <span className="text-primary font-medium">{f.confidence}%</span>
                  </span>
                  <span className="text-muted">
                    Evidence: <span className="text-primary font-medium">{f.evidenceLevel}</span>
                  </span>
                  <span className="text-muted">
                    Impact: <span className="text-primary font-medium">{f.practicalImpact}</span>
                  </span>
                  <span className="text-muted">
                    p-value: <span className="text-primary font-medium">{f.pValue}</span>
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
                      Outcome
                    </p>
                    <p className="text-fluid-sm text-primary font-medium leading-relaxed">{f.finding}</p>
                  </div>
                  <div>
                    <p className="text-fluid-xs text-muted uppercase tracking-wider mb-1">
                      Recommended action
                    </p>
                    <p className="text-fluid-sm text-secondary leading-relaxed">{f.action}</p>
                  </div>
                  {f.caveat && (
                    <p className="callout text-fluid-xs text-secondary">{f.caveat}</p>
                  )}
                </div>
              )}
            </article>
          );
        })}
        {filtered.length === 0 && (
          <div className="panel text-fluid-sm text-muted">
            No findings match your current filter settings.
          </div>
        )}
      </div>
    </section>
  );
}
