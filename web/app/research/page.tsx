import type { Metadata } from "next";
import {
  getClutchFactors,
  getUpsetProbabilities,
  getPlayerMapAffinities,
  getMatches,
  getSpiritFindings,
} from "@/lib/data";
import GroupedBarChart from "@/components/charts/GroupedBarChart";
import MythVsRecord from "@/components/research/MythVsRecord";
import ResearchFindingsExplorer from "@/components/research/ResearchFindingsExplorer";
import UpsetBinExplorer from "@/components/research/UpsetBinExplorer";
import { getSeasonId } from "@/lib/season-server";
import { pageTitle } from "@/lib/site-metadata";


export async function generateMetadata(): Promise<Metadata> {
  const seasonId = await getSeasonId();
  return { title: pageTitle("Research", seasonId) };
}

export default async function ResearchPage() {
  const seasonId = await getSeasonId();
  const findings = getSpiritFindings(seasonId);
  const upsetProbs = getUpsetProbabilities(seasonId);
  const clutchFactors = getClutchFactors(seasonId).sort(
    (a, b) => b.delta - a.delta,
  );
  const affinities = getPlayerMapAffinities(seasonId);
  const matches = getMatches(seasonId);

  const mythVsRecordItems = findings
    .filter((f) => f.mythHeadline)
    .map((f) => ({
      findingId: f.id,
      mythHeadline: f.mythHeadline!,
      verdict: f.verdict,
      verdictLine: f.effectSize,
    }));

  const confirmed = findings.filter((f) => f.verdict === "CONFIRMED").length;
  const busted = findings.filter((f) => f.verdict === "BUSTED").length;
  const inconclusive = findings.filter((f) => f.verdict === "INCONCLUSIVE").length;

  const upsetBars = upsetProbs.map((u) => ({
    bin: u.elo_bin,
    actual: Number((u.actual_upset_rate * 100).toFixed(1)),
    expected: Number((u.expected_upset_rate * 100).toFixed(1)),
  }));

  const topSpecialists = affinities
    .filter((a) => a.delta > 0.30 && a.map_n >= 3)
    .slice(0, 8);

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-14">
        <header className="mb-6 anim-fade-up">
          <p className="section-label-gold mb-3">Investigations</p>
          <h1 className="font-display text-fluid-2xl font-bold text-primary">
            Research Findings
          </h1>
          <p className="text-fluid-base text-secondary mt-2 max-w-2xl leading-relaxed">
            Ten tournament hypotheses tested on {matches.length} logged games:
            {confirmed} confirmed, {busted} busted, {inconclusive} inconclusive.
            Open each investigation below for results, methods, and caveats.
          </p>
          <p className="text-fluid-xs text-muted mt-3 max-w-2xl leading-relaxed border-l-2 border-ttl-gold/25 pl-3">
            Narrative write-ups describe the season that produced this research
            run. Upset, clutch, and map tables follow your selected season (
            <span className="text-ttl-gold font-mono">{seasonId}</span>
            ).
          </p>
        </header>

        <div className="callout mb-10 text-fluid-sm text-secondary leading-relaxed max-w-3xl">
          <strong className="text-primary">Reading the numbers:</strong> One
          season is not proof of a permanent rule. Rare civ pairings and
          player-map cells often have few games, so &ldquo;no effect found&rdquo;
          can mean the data were too thin, not that the idea is false. Treat
          striking results as worth revisiting when more games exist.
        </div>

        <div
          className="max-w-2xl rounded-lg border border-ttl-border-subtle/90 bg-ttl-raised/35 px-5 py-5 sm:px-8 sm:py-6 mb-10 anim-slide-in d1"
          aria-label="Verdict summary counts"
        >
          <div className="flex flex-wrap gap-x-12 gap-y-6 sm:justify-between sm:gap-x-8">
            <div className="min-w-[5.5rem]">
              <p className="text-fluid-xl font-display font-bold text-ttl-win leading-none tabular-nums">
                {confirmed}
              </p>
              <p className="text-fluid-xs text-muted mt-2 uppercase tracking-wider">
                confirmed
              </p>
            </div>
            <div className="min-w-[5.5rem]">
              <p className="text-fluid-xl font-display font-bold text-ttl-loss leading-none tabular-nums">
                {busted}
              </p>
              <p className="text-fluid-xs text-muted mt-2 uppercase tracking-wider">
                busted
              </p>
            </div>
            <div className="min-w-[5.5rem]">
              <p className="text-fluid-xl font-display font-bold text-ttl-accent leading-none tabular-nums">
                {inconclusive}
              </p>
              <p className="text-fluid-xs text-muted mt-2 uppercase tracking-wider">
                inconclusive
              </p>
            </div>
          </div>
        </div>

        <div className="divider mb-14" />

        <MythVsRecord items={mythVsRecordItems} />

        <ResearchFindingsExplorer findings={findings} />

        <div className="divider my-14" />

        {/* Supporting data: upset chart + top specialists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 mb-14">
          <section className="anim-fade-up">
            <h2 className="section-label mb-4">
              Upset rates: actual vs ELO model
            </h2>
            <div className="panel p-4 sm:p-5 space-y-6">
              <UpsetBinExplorer bins={upsetProbs} />
              <div className="pt-2 border-t border-ttl-border-subtle/60">
                <GroupedBarChart
                  data={upsetBars}
                  categoryKey="bin"
                  series={[
                    {
                      dataKey: "actual",
                      name: "Actual Upset %",
                      color: "var(--color-chart-5)",
                    },
                    {
                      dataKey: "expected",
                      name: "ELO Model %",
                      color: "var(--color-chart-2)",
                    },
                  ]}
                  height={280}
                  layout="horizontal"
                />
              </div>
            </div>
          </section>

          <section className="anim-fade-up d2">
            <h2 className="section-label mb-4">
              Top map specialists (delta &gt; 30%)
            </h2>
            <p className="text-fluid-xs text-muted mb-4 max-w-md leading-relaxed">
              At least three games on the map; very small samples are noisy.
            </p>
            <div className="panel p-4 sm:p-5">
              {topSpecialists.length === 0 ? (
                <p className="text-fluid-sm text-secondary text-center py-10 px-4 leading-relaxed border border-dashed border-ttl-border-subtle/80 rounded-md bg-ttl-navy/20">
                  No player in this season clears a 30% win-rate lift on a map
                  with three or more games. Lower the bar in the data slice or
                  check the map specialist investigation for the formal test.
                </p>
              ) : (
                <ul className="space-y-0 divide-y divide-ttl-border-subtle/50">
                  {topSpecialists.map((a) => (
                    <li
                      key={`${a.player}-${a.map}`}
                      className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-fluid-sm text-primary font-medium">
                          {a.player}
                        </span>
                        <span className="text-muted mx-1.5">/</span>
                        <span className="text-fluid-sm text-ttl-gold-light">
                          {a.map}
                        </span>
                      </div>
                      <div className="flex flex-col items-end sm:flex-row sm:items-baseline sm:gap-3 shrink-0 text-fluid-xs">
                        <span className="text-ttl-win font-bold font-display">
                          +{(a.delta * 100).toFixed(0)}%
                        </span>
                        <span className="text-muted">
                          {(a.map_wr * 100).toFixed(0)}% on {a.map_n}g
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        {/* Clutch leaders */}
        <section className="anim-fade-up mb-14">
          <h2 className="section-label mb-4">Clutch leaderboard</h2>
          <p className="text-fluid-xs text-muted mb-4 max-w-2xl leading-relaxed">
            Deciding-game win rate versus overall record. See the clutch
            investigation in the explorer for how this is defined.
          </p>
          {clutchFactors.length === 0 ? (
            <p className="text-fluid-sm text-secondary max-w-xl py-8 px-4 text-center border border-dashed border-ttl-border-subtle/80 rounded-md bg-ttl-navy/20">
              No clutch rows in the research extract for this season.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {clutchFactors.slice(0, 10).map((cf) => {
                const isPos = cf.delta >= 0;
                return (
                  <div
                    key={cf.player}
                    className="flex items-center gap-3 rounded-md border border-ttl-border-subtle/70 bg-ttl-raised/25 px-3 py-2.5 transition-[border-color,background-color] duration-200 ease-out hover:border-ttl-gold/15 hover:bg-ttl-raised/40"
                  >
                    <span className="text-fluid-sm text-primary font-medium w-24 truncate shrink-0">
                      {cf.player}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 text-fluid-xs">
                        <span
                          className={`font-display font-bold tabular-nums ${isPos ? "text-ttl-win" : "text-ttl-loss"}`}
                        >
                          {isPos ? "+" : ""}
                          {(cf.delta * 100).toFixed(1)}%
                        </span>
                        <span className="text-muted text-right">
                          clutch {(cf.clutch_wr * 100).toFixed(0)}% vs{" "}
                          {(cf.overall_wr * 100).toFixed(0)}% baseline (n=
                          {cf.clutch_n})
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
