import { getMapStats, getMapOutcomes } from "@/lib/data";
import HBarChart from "@/components/charts/HBarChart";
import DonutChart from "@/components/charts/DonutChart";

const DONUT_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "#6b7f94",
  "#8a6b5e",
  "#5a8a6b",
];

export default function MapsPage() {
  const maps = getMapStats().sort((a, b) => b.total_games - a.total_games);
  const outcomes = getMapOutcomes();

  const gamesBars = maps.map((m) => ({
    label: m.map,
    value: m.total_games,
    color: "var(--color-chart-3)",
  }));

  const durationBars = [...maps]
    .sort((a, b) => b.avg_duration - a.avg_duration)
    .map((m) => ({
      label: m.map,
      value: m.avg_duration,
      color: "var(--color-chart-2)",
    }));

  const leagueTotals = outcomes.reduce<Record<string, number>>((acc, o) => {
    acc[o.league] = (acc[o.league] || 0) + o.num_games;
    return acc;
  }, {});
  const donutData = Object.entries(leagueTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([league, count], i) => ({
      label: league,
      value: count,
      color: DONUT_COLORS[i % DONUT_COLORS.length],
    }));
  const totalLeagueGames = donutData.reduce((s, d) => s + d.value, 0);

  const topMap = maps[0];
  const longestAvg = [...maps].sort((a, b) => b.avg_duration - a.avg_duration)[0];
  const mostBalanced = [...maps].sort((a, b) => a.balance_std - b.balance_std)[0];

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <header className="mb-10 anim-fade-up">
          <p className="section-label-gold mb-3">Map Pool</p>
          <h1 className="font-display text-fluid-2xl font-bold text-primary">
            {maps.length} Maps
          </h1>
          <p className="text-fluid-base text-secondary mt-2 max-w-lg leading-relaxed">
            Season 5 map pool ranked by total games played, with duration
            analysis and league breakdowns.
          </p>
        </header>

        {/* Key insight strip -- asymmetric */}
        <div className="flex flex-wrap gap-x-10 gap-y-4 mb-14 anim-slide-in d1">
          <div>
            <p className="text-fluid-xl font-display font-bold text-ttl-gold leading-none">
              {topMap.map}
            </p>
            <p className="text-fluid-xs text-muted mt-1">
              most played ({topMap.total_games} games)
            </p>
          </div>
          <div>
            <p className="text-fluid-xl font-display font-bold text-primary leading-none">
              {longestAvg.avg_duration.toFixed(0)}m
            </p>
            <p className="text-fluid-xs text-muted mt-1">
              longest avg ({longestAvg.map})
            </p>
          </div>
          <div>
            <p className="text-fluid-xl font-display font-bold text-ttl-gold-light leading-none">
              {mostBalanced.map}
            </p>
            <p className="text-fluid-xs text-muted mt-1">
              most balanced ({mostBalanced.balance_std.toFixed(2)} std)
            </p>
          </div>
        </div>

        {/* Charts row -- asymmetric 2/3 + 1/3 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-14">
          <section className="lg:col-span-2 anim-scale-in d2">
            <h2 className="section-label mb-4">
              Games per Map
            </h2>
            <div className="panel-flush p-5">
              <HBarChart
                data={gamesBars}
                formatValue={(v) => `${v}`}
                accentColor="var(--color-chart-3)"
              />
            </div>
          </section>

          <section className="anim-fade-up d3">
            <h2 className="section-label mb-4">
              Games by League
            </h2>
            <div className="panel flex flex-col items-center py-6">
              <DonutChart
                data={donutData}
                centerValue={String(totalLeagueGames)}
                centerLabel="total games"
              />
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 justify-center">
                {donutData.map((d) => (
                  <div
                    key={d.label}
                    className="flex items-center gap-1.5 text-fluid-xs"
                  >
                    <span
                      className="w-2 h-2 rounded-sm shrink-0"
                      style={{ background: d.color }}
                    />
                    <span className="text-secondary">{d.label}</span>
                    <span className="text-muted">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Duration chart -- full width, different panel */}
        <section className="mb-14 anim-slide-in d4">
          <h2 className="section-label mb-4">
            Average Duration by Map
          </h2>
          <div className="panel-accent">
            <HBarChart
              data={durationBars}
              formatValue={(v) => `${v.toFixed(1)}m`}
              accentColor="var(--color-chart-2)"
            />
          </div>
        </section>

        <div className="divider my-10" />

        {/* Map cards -- featured #1, then compact grid */}
        <section className="anim-fade-up d5">
          <h2 className="section-label mb-6">
            Map Details
          </h2>

          {/* Featured top map */}
          <div className="lift panel-accent mb-6 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="rank-badge rank-1">1</span>
                <h3 className="font-display text-fluid-lg font-bold text-ttl-gold">
                  {maps[0].map}
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-4 text-fluid-xs">
                <div>
                  <span className="text-muted block uppercase tracking-wider mb-0.5">
                    Duration
                  </span>
                  <span className="text-secondary font-medium">
                    {maps[0].avg_duration.toFixed(1)}m
                  </span>
                </div>
                <div>
                  <span className="text-muted block uppercase tracking-wider mb-0.5">
                    Top Civ
                  </span>
                  <span className="text-secondary font-medium truncate block">
                    {maps[0].most_common_civ}
                  </span>
                </div>
                <div>
                  <span className="text-muted block uppercase tracking-wider mb-0.5">
                    Balance
                  </span>
                  <span className="text-ttl-gold font-medium">
                    {maps[0].balance_std.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-fluid-2xl font-display font-bold text-primary leading-none">
                {maps[0].total_games}
              </p>
              <p className="text-fluid-xs text-muted mt-1">games</p>
            </div>
          </div>

          {/* Remaining maps */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {maps.slice(1).map((m, i) => (
              <div
                key={m.map}
                className="lift panel hover:border-ttl-border transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`rank-badge ${
                      i === 0 ? "rank-2" : i === 1 ? "rank-3" : "rank-n"
                    }`}>{i + 2}</span>
                    <h3 className="font-display text-fluid-sm font-bold text-ttl-gold-light">
                      {m.map}
                    </h3>
                  </div>
                  <span className="text-fluid-xl font-display font-bold text-primary leading-none">
                    {m.total_games}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-fluid-xs">
                  <div>
                    <span className="text-muted block uppercase tracking-wider mb-0.5">
                      Avg Dur.
                    </span>
                    <span className="text-secondary font-medium">
                      {m.avg_duration.toFixed(1)}m
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block uppercase tracking-wider mb-0.5">
                      Top Civ
                    </span>
                    <span className="text-secondary font-medium truncate block">
                      {m.most_common_civ}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block uppercase tracking-wider mb-0.5">
                      Balance
                    </span>
                    <span
                      className={`font-medium ${
                        m.balance_std < 2
                          ? "text-ttl-gold"
                          : m.balance_std < 5
                          ? "text-secondary"
                          : "text-ttl-bronze"
                      }`}
                    >
                      {m.balance_std.toFixed(2)}
                    </span>
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
