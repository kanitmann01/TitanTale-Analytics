import { getCivStats } from "@/lib/data";
import HBarChart from "@/components/charts/HBarChart";
import ScatterChart from "@/components/charts/ScatterChart";

export default function CivilizationsPage() {
  const civs = getCivStats().sort((a, b) => b.pick_rate - a.pick_rate);

  const pickBars = civs.slice(0, 15).map((c) => ({
    label: c.civilization,
    value: c.pick_rate * 100,
    color: "var(--color-chart-2)",
  }));

  const winBars = [...civs]
    .sort((a, b) => b.win_rate - a.win_rate)
    .slice(0, 15)
    .map((c) => ({
      label: c.civilization,
      value: c.win_rate * 100,
      color:
        c.win_rate >= 0.55
          ? "var(--color-chart-1)"
          : c.win_rate >= 0.45
          ? "var(--color-chart-2)"
          : "var(--color-loss)",
    }));

  const scatterData = civs
    .filter((c) => c.games_played >= 5)
    .map((c) => ({
      label: c.civilization,
      x: c.pick_rate * 100,
      y: c.win_rate,
      size: Math.max(3, Math.min(c.games_played / 4, 10)),
    }));

  const topPick = civs[0];
  const topWin = [...civs].sort((a, b) => b.win_rate - a.win_rate)[0];
  const avgWr = civs.reduce((s, c) => s + c.win_rate, 0) / civs.length;

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <header className="mb-10 anim-fade-up">
          <p className="section-label-gold mb-3">Civilization Analysis</p>
          <h1 className="font-display text-fluid-2xl font-bold text-primary">
            {civs.length} Civilizations
          </h1>
          <p className="text-fluid-base text-secondary mt-2 max-w-lg leading-relaxed">
            Pick rates, win rates, and the emerging meta from Season 5 matches.
          </p>
        </header>

        {/* Key insight strip */}
        <div className="flex flex-wrap gap-x-10 gap-y-4 mb-12 anim-slide-in d1">
          <div>
            <p className="text-fluid-xl font-display font-bold text-ttl-gold leading-none">
              {topPick.civilization}
            </p>
            <p className="text-fluid-xs text-muted mt-1">
              most picked ({(topPick.pick_rate * 100).toFixed(1)}%)
            </p>
          </div>
          <div>
            <p className="text-fluid-xl font-display font-bold text-ttl-gold-light leading-none">
              {topWin.civilization}
            </p>
            <p className="text-fluid-xs text-muted mt-1">
              highest win rate ({(topWin.win_rate * 100).toFixed(0)}%)
            </p>
          </div>
          <div>
            <p className="text-fluid-xl font-display font-bold text-primary leading-none">
              {(avgWr * 100).toFixed(1)}%
            </p>
            <p className="text-fluid-xs text-muted mt-1">avg win rate</p>
          </div>
        </div>

        {/* Scatter -- full width for prominence */}
        <section className="mb-14 anim-scale-in d2">
          <h2 className="section-label mb-4">
            Pick Rate vs Win Rate
          </h2>
          <div className="panel">
            <ScatterChart
              data={scatterData}
              xLabel="Pick Rate %"
              yLabel="Win Rate"
              xFormatType="decimal"
              color="var(--color-chart-2)"
            />
          </div>
          <p className="text-fluid-xs text-muted mt-3">
            Civilizations with fewer than 5 games excluded. Bubble size reflects
            total games played.
          </p>
        </section>

        {/* Two bar charts -- different panel styles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
          <section className="anim-slide-in d3">
            <h2 className="section-label mb-4">
              Most Picked -- Top 15
            </h2>
            <div className="panel-flush p-5">
              <HBarChart
                data={pickBars}
                formatValue={(v) => `${v.toFixed(1)}%`}
                accentColor="var(--color-chart-2)"
              />
            </div>
          </section>

          <section className="anim-fade-up d4">
            <h2 className="section-label mb-4">
              Highest Win Rate -- Top 15
            </h2>
            <div className="panel p-5">
              <HBarChart
                data={winBars}
                maxValue={100}
                formatValue={(v) => `${v.toFixed(0)}%`}
              />
            </div>
          </section>
        </div>

        <div className="divider my-10" />

        {/* Full civ grid -- tiered: top 5 prominent, rest compact */}
        <section className="anim-fade-up d5">
          <h2 className="section-label mb-6">
            All Civilizations
          </h2>

          {/* Tier 1: top 5 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {civs.slice(0, 6).map((c, i) => {
              const winPct = (c.win_rate * 100).toFixed(1);
              const pickPct = (c.pick_rate * 100).toFixed(1);
              return (
                <div
                  key={c.civilization}
                  className={`lift rounded-lg border px-5 py-4 ${
                    i < 2
                      ? "panel-accent"
                      : "border-ttl-border-subtle bg-ttl-raised"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`rank-badge ${
                      i === 0 ? "rank-1" : i === 1 ? "rank-2" : i === 2 ? "rank-3" : "rank-n"
                    }`}>{i + 1}</span>
                    <span className="text-fluid-sm text-primary font-bold truncate">
                      {c.civilization}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-fluid-xs">
                    <span className="text-muted">{c.games_played}g</span>
                    <span className={Number(winPct) >= 55 ? "text-ttl-gold font-bold" : "text-secondary"}>
                      {winPct}% WR
                    </span>
                    <span className="text-ttl-accent">{pickPct}% pick</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rest: compact rows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {civs.slice(6).map((c) => {
              const winPct = (c.win_rate * 100).toFixed(1);
              const pickPct = (c.pick_rate * 100).toFixed(1);
              const isWeak = c.win_rate < 0.45;
              return (
                <div
                  key={c.civilization}
                  className="flex items-center justify-between rounded border border-ttl-border-subtle/70 bg-ttl-raised/60 px-4 py-2.5 hover:bg-ttl-slate/50 transition-colors"
                >
                  <span className="text-fluid-sm text-primary font-medium truncate mr-3">
                    {c.civilization}
                  </span>
                  <div className="flex items-center gap-4 text-fluid-xs shrink-0">
                    <span className="text-muted">{c.games_played}g</span>
                    <span className={isWeak ? "text-ttl-loss" : "text-secondary"}>
                      {winPct}%
                    </span>
                    <span className="text-ttl-accent">{pickPct}%</span>
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
