import {
  getMatches,
  getPlayerStats,
  getCivStats,
  getMapStats,
  getStandings,
  getPlayerCivs,
  getClutchFactors,
  getUpsetProbabilities,
  getAdvancedMetrics,
  getCivMatchups,
  getDraftPositionOutcomes,
} from "@/lib/data";
import HBarChart from "@/components/charts/HBarChart";
import DonutChart from "@/components/charts/DonutChart";
import ResidualChart from "@/components/charts/ResidualChart";
import GroupedBarChart from "@/components/charts/GroupedBarChart";
import MiniBar from "@/components/charts/MiniBar";

const LEAGUE_COLORS: Record<string, string> = {
  Platinum: "var(--color-chart-1)",
  Gold: "var(--color-chart-3)",
  Silver: "var(--color-chart-2)",
  Bronze: "var(--color-chart-5)",
};

export default function AnalysisPage() {
  const matches = getMatches();
  const playerStats = getPlayerStats().sort((a, b) => b.win_rate - a.win_rate);
  const civStats = getCivStats();
  const mapStats = getMapStats();
  const standings = getStandings();
  const playerCivs = getPlayerCivs();
  const clutchFactors = getClutchFactors().sort((a, b) => b.delta - a.delta);
  const upsetProbs = getUpsetProbabilities();
  const advancedMetrics = getAdvancedMetrics();
  const civMatchups = getCivMatchups().slice(0, 15);
  const draftOutcomes = getDraftPositionOutcomes();

  // Duration histogram
  const durationBuckets: Record<string, number> = {};
  matches.forEach((m) => {
    const bucket = `${Math.floor(m.duration_minutes / 10) * 10}-${
      Math.floor(m.duration_minutes / 10) * 10 + 9
    }m`;
    durationBuckets[bucket] = (durationBuckets[bucket] || 0) + 1;
  });
  const durationBars = Object.entries(durationBuckets)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .map(([bucket, count]) => ({
      label: bucket,
      value: count,
      color: "var(--color-chart-2)",
    }));

  // League donut
  const leagues = standings.reduce<Record<string, Set<string>>>((acc, s) => {
    if (!acc[s.league]) acc[s.league] = new Set();
    acc[s.league].add(s.player);
    return acc;
  }, {});
  const leagueDonut = Object.entries(leagues)
    .map(([league, players]) => ({
      label: league,
      value: players.size,
      color: LEAGUE_COLORS[league] || "var(--color-text-muted)",
    }))
    .sort((a, b) => b.value - a.value);

  // Unique civs by league
  const civsByLeague = playerCivs.reduce<Record<string, Set<string>>>(
    (acc, pc) => {
      if (!acc[pc.league]) acc[pc.league] = new Set();
      acc[pc.league].add(pc.civilization);
      return acc;
    },
    {},
  );

  // Map balance
  const balancedMaps = [...mapStats]
    .sort((a, b) => a.balance_std - b.balance_std)
    .slice(0, 10)
    .map((m) => ({
      label: m.map,
      value: m.balance_std,
      color:
        m.balance_std < 2
          ? "var(--color-chart-4)"
          : m.balance_std < 5
          ? "var(--color-chart-2)"
          : "var(--color-chart-3)",
    }));

  // Residual chart data from advanced metrics
  const residualData = advancedMetrics
    .map((m) => ({
      label: m.player,
      expected: m.expected_win_rate,
      residual: m.performance_residual,
      tier: m.performance_tier,
    }))
    .sort((a, b) => b.residual - a.residual);

  // Upset grouped bars
  const upsetBars = upsetProbs.map((u) => ({
    bin: u.elo_bin,
    actual: Number((u.actual_upset_rate * 100).toFixed(1)),
    expected: Number((u.expected_upset_rate * 100).toFixed(1)),
  }));

  // Aggregate stats
  const avgWinRate =
    playerStats.reduce((s, p) => s + p.win_rate, 0) / playerStats.length;
  const avgDuration =
    matches.reduce((s, m) => s + m.duration_minutes, 0) / matches.length;

  // Snowball effect computation
  const game1Winners = new Map<number, string>();
  const seriesWinCounts = new Map<string, number>();
  for (const m of matches) {
    if (m.game_number === 1) game1Winners.set(m.match_id, m.winner);
    const key = `${m.match_id}|${m.winner}`;
    seriesWinCounts.set(key, (seriesWinCounts.get(key) || 0) + 1);
  }
  const seriesWinners = new Map<number, string>();
  Array.from(seriesWinCounts.entries()).forEach(([key, count]) => {
    const [mid, player] = key.split("|");
    const midNum = Number(mid);
    const current = seriesWinners.get(midNum);
    if (
      !current ||
      count > (seriesWinCounts.get(`${midNum}|${current}`) || 0)
    ) {
      seriesWinners.set(midNum, player);
    }
  });
  let snowballHits = 0;
  let snowballTotal = 0;
  for (const [mid, g1Winner] of Array.from(game1Winners.entries())) {
    const sw = seriesWinners.get(mid);
    if (sw) {
      snowballTotal++;
      if (sw === g1Winner) snowballHits++;
    }
  }
  const snowballPct = snowballTotal > 0 ? snowballHits / snowballTotal : 0;

  // Positional advantage
  const p1Wins = matches.filter((m) => m.winner === m.player1).length;
  const p1Pct = p1Wins / matches.length;

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <header className="mb-6 anim-fade-up">
          <p className="section-label-gold mb-3">Deep Dive</p>
          <h1 className="font-display text-fluid-2xl font-bold text-primary">
            Tournament Analysis
          </h1>
          <p className="text-fluid-base text-secondary mt-2 max-w-2xl leading-relaxed">
            Cross-cutting statistical views from {matches.length} games across{" "}
            {playerStats.length} players, {civStats.length} civilizations, and{" "}
            {mapStats.length} maps.
          </p>
        </header>

        {/* Key insight strip */}
        <div className="flex flex-wrap gap-x-10 gap-y-4 py-6 mb-6 anim-slide-in d1">
          <div>
            <p className="text-fluid-xl font-display font-bold text-ttl-gold leading-none">
              {(avgWinRate * 100).toFixed(1)}%
            </p>
            <p className="text-fluid-xs text-muted mt-1.5">avg win rate</p>
          </div>
          <div>
            <p className="text-fluid-xl font-display font-bold text-primary leading-none">
              {avgDuration.toFixed(0)}
              <span className="text-fluid-lg text-muted ml-0.5">min</span>
            </p>
            <p className="text-fluid-xs text-muted mt-1.5">avg game length</p>
          </div>
          <div>
            <p className="text-fluid-xl font-display font-bold text-ttl-accent leading-none">
              {(snowballPct * 100).toFixed(0)}%
            </p>
            <p className="text-fluid-xs text-muted mt-1.5">
              game-1 winners take series
            </p>
          </div>
          <div>
            <p className="text-fluid-xl font-display font-bold text-ttl-gold-light leading-none">
              {(p1Pct * 100).toFixed(0)}%
            </p>
            <p className="text-fluid-xs text-muted mt-1.5">
              Player 1 win rate
            </p>
          </div>
        </div>

        <div className="divider mb-14" />

        {/* Row 1: ELO Residuals + Duration histogram */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          <section className="anim-scale-in d2">
            <h2 className="section-label mb-4">
              Performance vs ELO Expectation
            </h2>
            <div className="panel">
              <ResidualChart data={residualData} />
            </div>
            <p className="callout mt-4 text-fluid-xs text-secondary">
              Points above zero are overperforming their ELO rating; below zero
              are underperforming. Color indicates tier classification.
            </p>
          </section>

          <section className="anim-slide-in d3">
            <h2 className="section-label mb-4">
              Game Duration Distribution
            </h2>
            <div className="panel-flush p-5">
              <HBarChart
                data={durationBars}
                formatValue={(v) => `${v}`}
                accentColor="var(--color-chart-2)"
              />
            </div>
            <p className="callout mt-4 text-fluid-xs text-secondary">
              Most games cluster between 20-39 minutes. Extremely long games
              are rare outliers.
            </p>
          </section>
        </div>

        {/* Row 2: Civ Matchup Table + Upset Probability */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
          <section className="lg:col-span-2 anim-fade-up d4">
            <h2 className="section-label mb-4">
              Top Civilization Matchups
            </h2>
            <div className="panel overflow-x-auto">
              <table className="w-full text-fluid-sm">
                <thead>
                  <tr className="border-b border-ttl-border text-left text-muted uppercase tracking-wider text-fluid-xs">
                    <th className="py-2.5 pr-3">Matchup</th>
                    <th className="py-2.5 pr-3 text-right">Games</th>
                    <th className="py-2.5 pr-3 text-right">Civ 1 WR</th>
                    <th className="py-2.5 pr-3 w-28">Balance</th>
                    <th className="py-2.5 text-right">Avg Dur.</th>
                  </tr>
                </thead>
                <tbody>
                  {civMatchups.map((cm) => {
                    const wr = cm.civ1_win_rate;
                    const balance = Math.abs(wr - 0.5);
                    return (
                      <tr
                        key={`${cm.civilization1}-${cm.civilization2}`}
                        className="border-b border-ttl-border-subtle/60 hover:bg-ttl-slate/40 transition-colors"
                      >
                        <td className="py-2.5 pr-3 text-primary font-medium">
                          {cm.civilization1}{" "}
                          <span className="text-muted">vs</span>{" "}
                          {cm.civilization2}
                        </td>
                        <td className="py-2.5 pr-3 text-right text-secondary">
                          {cm.games_played}
                        </td>
                        <td className="py-2.5 pr-3 text-right">
                          <span
                            className={
                              wr > 0.6
                                ? "text-ttl-gold font-bold"
                                : wr < 0.4
                                ? "text-ttl-loss"
                                : "text-secondary"
                            }
                          >
                            {(wr * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="py-2.5 pr-3">
                          <MiniBar
                            value={1 - balance * 2}
                            color={
                              balance < 0.1
                                ? "var(--color-chart-4)"
                                : "var(--color-chart-5)"
                            }
                          />
                        </td>
                        <td className="py-2.5 text-right text-muted">
                          {cm.avg_duration.toFixed(0)}m
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="text-fluid-xs text-muted mt-3 px-1">
                No civ matchup reached statistical significance (p &lt; 0.05)
                at these sample sizes. Treat as observed outcomes, not
                predictions.
              </p>
            </div>
          </section>

          <section className="anim-scale-in d5">
            <h2 className="section-label mb-4">
              Upset Probability by ELO Gap
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
            <p className="callout mt-4 text-fluid-xs text-secondary">
              Tournament upsets exceed ELO predictions by a factor of 1.62x
              across all ELO bins. The wider the gap, the more volatile
              the outcome.
            </p>
          </section>
        </div>

        {/* Row 3: Clutch Leaderboard + Snowball/Positional callouts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          <section className="anim-slide-in d6">
            <h2 className="section-label mb-5">
              Clutch Factor -- Deciding Game Performance
            </h2>
            <div className="space-y-2">
              {clutchFactors.map((cf, i) => {
                const isPositive = cf.delta >= 0;
                const isSignificant = cf.p_value < 0.05;
                return (
                  <div
                    key={cf.player}
                    className={`flex items-center gap-3 panel-inset ${
                      isSignificant
                        ? "!border-ttl-accent/40 !bg-ttl-raised"
                        : ""
                    }`}
                  >
                    <span
                      className={`rank-badge ${
                        i === 0
                          ? "rank-1"
                          : i === 1
                          ? "rank-2"
                          : i === 2
                          ? "rank-3"
                          : "rank-n"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-0.5">
                        <span className="text-fluid-sm text-primary font-medium truncate">
                          {cf.player}
                          {isSignificant && (
                            <span className="text-fluid-xs text-ttl-accent ml-1.5">
                              *
                            </span>
                          )}
                        </span>
                        <div className="flex gap-3 shrink-0 ml-2 text-fluid-xs">
                          <span
                            className={
                              isPositive
                                ? "text-ttl-win font-bold"
                                : "text-ttl-loss font-bold"
                            }
                          >
                            {isPositive ? "+" : ""}
                            {(cf.delta * 100).toFixed(1)}%
                          </span>
                          <span className="text-muted">n={cf.clutch_n}</span>
                        </div>
                      </div>
                      <MiniBar
                        value={Math.min(
                          Math.max(0.5 + cf.delta, 0),
                          1,
                        )}
                        color={
                          isPositive
                            ? "var(--color-chart-4)"
                            : "var(--color-chart-5)"
                        }
                      />
                    </div>
                  </div>
                );
              })}
              <p className="text-fluid-xs text-muted mt-3">
                * = statistically significant (p &lt; 0.05). Delta measures
                clutch game WR minus overall baseline.
              </p>
            </div>
          </section>

          <section className="anim-fade-up d7">
            <h2 className="section-label mb-5">
              Map Balance (lower = more balanced)
            </h2>
            <div className="panel">
              <HBarChart
                data={balancedMaps}
                formatValue={(v) => v.toFixed(2)}
              />
            </div>
            <p className="callout mt-4 text-fluid-xs text-secondary">
              Balance std. dev. measures how evenly wins are distributed.
              Lower values indicate a more balanced map.
            </p>

            <div className="mt-10">
              <h2 className="section-label mb-4">Players by League</h2>
              <div className="panel flex flex-col items-center py-6">
                <DonutChart
                  data={leagueDonut}
                  centerValue={String(
                    leagueDonut.reduce((s, d) => s + d.value, 0),
                  )}
                  centerLabel="players"
                />
                <div className="mt-5 space-y-1.5 w-full">
                  {leagueDonut.map((d) => (
                    <div
                      key={d.label}
                      className="flex items-center justify-between text-fluid-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-sm shrink-0"
                          style={{ background: d.color }}
                        />
                        <span className="text-secondary">{d.label}</span>
                      </div>
                      <span className="text-primary font-medium">
                        {d.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-ttl-border-subtle w-full">
                  <p className="section-label mb-2">Unique Civs by League</p>
                  {Object.entries(civsByLeague)
                    .sort((a, b) => b[1].size - a[1].size)
                    .map(([league, civSet]) => (
                      <div
                        key={league}
                        className="flex items-center justify-between text-fluid-xs mb-1"
                      >
                        <span className="text-secondary">{league}</span>
                        <span className="text-primary font-medium">
                          {civSet.size}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Row 4: Draft Position Analysis */}
        <div className="divider my-12" />
        <section className="anim-fade-up d8">
          <h2 className="section-label mb-5">
            Draft Position Analysis
          </h2>
          <p className="text-fluid-sm text-secondary mb-6 max-w-xl">
            Civilization distribution by pick order across 141 games with
            draft data. Each game has 3 civ draft positions per player.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {draftOutcomes.map((d) => (
              <div
                key={d.draft_position}
                className="panel"
              >
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-display text-fluid-xl font-bold text-ttl-gold leading-none">
                    #{d.draft_position}
                  </span>
                  <span className="text-fluid-xs text-muted">
                    pick
                  </span>
                </div>
                <div className="space-y-2 text-fluid-xs">
                  <div className="flex justify-between">
                    <span className="text-muted">Total picks</span>
                    <span className="text-primary font-medium">
                      {d.total_picks}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Unique civs</span>
                    <span className="text-primary font-medium">
                      {d.unique_civs}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-ttl-border-subtle">
                    <p className="text-muted mb-1.5">Top civilizations</p>
                    <div className="flex flex-wrap gap-1.5">
                      {d.top_civs.split(";").map((entry) => {
                        const match = entry.match(/^(.+)\((\d+)\)$/);
                        return match ? (
                          <span
                            key={entry}
                            className="bg-ttl-slate/60 text-secondary px-2 py-0.5 rounded"
                          >
                            {match[1]} ({match[2]})
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-ttl-border-subtle">
                    <p className="text-muted mb-1.5">Top maps</p>
                    <div className="flex flex-wrap gap-1.5">
                      {d.top_maps.split(";").map((entry) => {
                        const match = entry.match(/^(.+)\((\d+)\)$/);
                        return match ? (
                          <span
                            key={entry}
                            className="bg-ttl-slate/60 text-secondary px-2 py-0.5 rounded"
                          >
                            {match[1]} ({match[2]})
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
