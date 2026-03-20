import type { Metadata } from "next";
import {
  getClutchFactors,
  getUpsetProbabilities,
  getPlayerMapAffinities,
  getMatches,
} from "@/lib/data";
import GroupedBarChart from "@/components/charts/GroupedBarChart";
import ResearchFindingsExplorer, {
  type ResearchFinding,
} from "@/components/research/ResearchFindingsExplorer";
import { getSeasonId } from "@/lib/season-server";
import { pageTitle } from "@/lib/site-metadata";

const FINDINGS: ResearchFinding[] = [
  {
    id: 1,
    title: "Snowball Effect",
    hypothesis:
      "Game-1 winners take the series at a rate significantly above 50%.",
    method:
      "Conditional probability P(series win | game 1 win), Fisher's exact test (one-sided).",
    finding: "Game-1 winners took the series 89.0% of the time (121/136).",
    pValue: "0.0000",
    verdict: "CONFIRMED",
    confidence: 98,
    evidenceLevel: "High",
    practicalImpact: "High",
    action:
      "Prioritize game 1 preparation and opening-map comfort in every match plan.",
    caveat:
      "This is robust in this dataset, but verify in future seasons before generalizing.",
  },
  {
    id: 2,
    title: "Positional Advantage",
    hypothesis:
      "The first-listed player (Player 1) wins at a rate significantly different from 50%.",
    method: "Binomial test of Player-1 win rate vs 50%, with per-map breakdown.",
    finding: "Player-1 win rate: 74.2% (405/546), p = 0.0000.",
    pValue: "0.0000",
    verdict: "CONFIRMED",
    confidence: 96,
    evidenceLevel: "High",
    practicalImpact: "Medium",
    action:
      "Treat this as a potential recording-order bias until validated against independent data.",
    caveat:
      "Likely metadata artifact (seed ordering), not true in-game spawn/position advantage.",
  },
  {
    id: 3,
    title: "Fatigue Factor",
    hypothesis:
      "Higher-ELO player win rate declines in later games of a series.",
    method: "Stratified win rates by game position (1/2/3+), chi-square test.",
    finding: "Game 1: 39.7%, Game 2: 41.2%, Game 3+: 42.0%.",
    pValue: "0.9082",
    verdict: "BUSTED",
    confidence: 88,
    evidenceLevel: "High",
    practicalImpact: "Low",
    action:
      "Do not assume fatigue-decay effects in late games when drafting strategy.",
  },
  {
    id: 4,
    title: "Comfort Picks vs. Wild Cards",
    hypothesis:
      "Comfort picks (top-3 most-played civs) outperform one-off picks.",
    method: "Per-player paired win rates, Wilcoxon signed-rank test (one-sided).",
    finding: "Comfort: 46.8%, Wild Cards: 50.9% (p = 0.8847).",
    pValue: "0.8847",
    verdict: "BUSTED",
    confidence: 84,
    evidenceLevel: "Medium",
    practicalImpact: "Medium",
    action:
      "Keep draft flexibility; one-off civs are not inherently weaker in this event.",
  },
  {
    id: 5,
    title: "Clutch Factor",
    hypothesis:
      "Some players significantly over/underperform in deciding games.",
    method: "Per-player binomial test comparing clutch win rate to overall baseline.",
    finding:
      "1 player with statistically significant clutch deviation (p < 0.05).",
    pValue: "0.0287",
    verdict: "CONFIRMED",
    confidence: 74,
    evidenceLevel: "Medium",
    practicalImpact: "Medium",
    action:
      "Use clutch signal for player-specific prep, but avoid overfitting for the full field.",
    caveat: "Multiple-testing correction reduces certainty for this one isolated signal.",
  },
  {
    id: 6,
    title: "One-Sided Civ Matchups",
    hypothesis: "Some civ pairings have significantly imbalanced win rates.",
    method: "Civ-vs-civ win rate matrix (min 3 games), binomial test per pair.",
    finding: "0 matchups significantly one-sided out of 25 tested.",
    pValue: "1.0000",
    verdict: "BUSTED",
    confidence: 80,
    evidenceLevel: "Low",
    practicalImpact: "Medium",
    action:
      "Avoid hard civ-counter claims from this tournament alone; rely on broader datasets.",
    caveat:
      "Sparse matchup counts heavily limit power across 39 civilizations.",
  },
  {
    id: 7,
    title: "Map Specialists",
    hypothesis:
      "Certain players have statistically significant map affinities.",
    method:
      "Per-player per-map win rate vs baseline, binomial test (min 3 games).",
    finding: "1 significant map affinity pair out of 196.",
    pValue: "0.0184",
    verdict: "CONFIRMED",
    confidence: 72,
    evidenceLevel: "Medium",
    practicalImpact: "High",
    action:
      "Use map affinity as a scouting input, but require minimum game-count thresholds.",
    caveat:
      "After strict multiple-comparison correction, significance weakens considerably.",
  },
  {
    id: 8,
    title: "Upset Probability",
    hypothesis: "Tournament upsets exceed the logistic ELO model expectation.",
    method:
      "Bin by ELO difference, compare actual upset rate to E(win) = 1/(1+10^(-d/400)), binomial test.",
    finding: "Tournament volatility factor: 1.62x (p = 0.0000).",
    pValue: "0.0000",
    verdict: "CONFIRMED",
    confidence: 95,
    evidenceLevel: "High",
    practicalImpact: "High",
    action:
      "Calibrate predictive models to tournament volatility, not ladder-style ELO certainty.",
  },
  {
    id: 9,
    title: "Tempo Control",
    hypothesis:
      "Players with low duration variance (consistent tempo) win more.",
    method:
      "K-means clustering (k=3) on duration distributions, Spearman correlation (CV vs win rate).",
    finding: "Spearman rho = 0.0436 (p = 0.8551).",
    pValue: "0.8551",
    verdict: "BUSTED",
    confidence: 82,
    evidenceLevel: "Medium",
    practicalImpact: "Low",
    action:
      "Do not prioritize tempo consistency as a standalone predictor of win rate.",
  },
  {
    id: 10,
    title: "Meta Evolution",
    hypothesis: "Civ pick distributions change across tournament stages.",
    method: "Per-civ pick rate by stage, chi-square test.",
    finding: "Only one stage in data -- cannot measure evolution.",
    pValue: "N/A",
    verdict: "INCONCLUSIVE",
    confidence: 20,
    evidenceLevel: "Low",
    practicalImpact: "Low",
    action:
      "Track picks across multiple stages/seasons before making any meta-evolution claims.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const seasonId = await getSeasonId();
  return { title: pageTitle("Research", seasonId) };
}

export default async function ResearchPage() {
  const seasonId = await getSeasonId();
  const upsetProbs = getUpsetProbabilities(seasonId);
  const clutchFactors = getClutchFactors(seasonId).sort(
    (a, b) => b.delta - a.delta,
  );
  const affinities = getPlayerMapAffinities(seasonId);
  const matches = getMatches(seasonId);

  const confirmed = FINDINGS.filter((f) => f.verdict === "CONFIRMED").length;
  const busted = FINDINGS.filter((f) => f.verdict === "BUSTED").length;

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
      <div className="max-w-6xl mx-auto px-6 py-14">
        <header className="mb-6 anim-fade-up">
          <p className="section-label-gold mb-3">Investigations</p>
          <h1 className="font-display text-fluid-2xl font-bold text-primary">
            Research Findings
          </h1>
          <p className="text-fluid-base text-secondary mt-2 max-w-2xl leading-relaxed">
            10 hypotheses tested against {matches.length} games of tournament
            data using formal statistical methods. Each finding carries a
            verdict, p-value, and sample size.
          </p>
        </header>

        <div className="flex flex-wrap gap-x-10 gap-y-4 py-6 mb-10 anim-slide-in d1">
          <div>
            <p className="text-fluid-xl font-display font-bold text-ttl-win leading-none">
              {confirmed}
            </p>
            <p className="text-fluid-xs text-muted mt-1.5">confirmed</p>
          </div>
          <div>
            <p className="text-fluid-xl font-display font-bold text-ttl-loss leading-none">
              {busted}
            </p>
            <p className="text-fluid-xs text-muted mt-1.5">busted</p>
          </div>
          <div>
            <p className="text-fluid-xl font-display font-bold text-ttl-accent leading-none">
              {10 - confirmed - busted}
            </p>
            <p className="text-fluid-xs text-muted mt-1.5">inconclusive</p>
          </div>
        </div>

        <div className="divider mb-14" />
        <ResearchFindingsExplorer findings={FINDINGS} />

        <div className="divider my-14" />

        {/* Supporting data: upset chart + top specialists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
          <section className="anim-fade-up">
            <h2 className="section-label mb-4">
              Upset Rates: Actual vs ELO Model
            </h2>
            <div className="panel p-4">
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
          </section>

          <section className="anim-fade-up">
            <h2 className="section-label mb-4">
              Top Map Specialists (delta &gt; 30%)
            </h2>
            <p className="text-fluid-xs text-muted mb-3">
              Minimum 3 games in source filter; entries with 3-4 games are
              anecdotal. Prefer cells with higher n when scouting.
            </p>
            <div className="space-y-2">
              {topSpecialists.map((a) => (
                <div
                  key={`${a.player}-${a.map}`}
                  className="flex items-center justify-between panel-inset"
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
                  <div className="flex gap-3 shrink-0 ml-2 text-fluid-xs">
                    <span className="text-ttl-win font-bold">
                      +{(a.delta * 100).toFixed(0)}%
                    </span>
                    <span className="text-muted">
                      {(a.map_wr * 100).toFixed(0)}% on {a.map_n}g
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Clutch leaders */}
        <section className="anim-fade-up mb-14">
          <h2 className="section-label mb-4">
            Clutch Leaderboard (research deep dive)
          </h2>
          <p className="text-fluid-xs text-muted mb-3 max-w-2xl leading-relaxed">
            Full methodology lives in the findings explorer above. This table
            adds baseline clutch WR vs overall WR for context (unlike the
            Analysis page delta-only summary).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {clutchFactors.slice(0, 10).map((cf) => {
              const isPos = cf.delta >= 0;
              return (
                <div
                  key={cf.player}
                  className="flex items-center gap-3 panel-inset"
                >
                  <span className="text-fluid-sm text-primary font-medium w-24 truncate">
                    {cf.player}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between text-fluid-xs mb-0.5">
                      <span className={isPos ? "text-ttl-win" : "text-ttl-loss"}>
                        {isPos ? "+" : ""}
                        {(cf.delta * 100).toFixed(1)}%
                      </span>
                      <span className="text-muted">
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
        </section>
      </div>
    </main>
  );
}
