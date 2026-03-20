import type { Metadata } from "next";
import { getCivStats } from "@/lib/data";
import MetaScatterChart from "@/components/charts/MetaScatterChart";
import RankedHBarChart from "@/components/charts/RankedHBarChart";
import PageLabel from "@/components/PageLabel";
import { getSeasonId } from "@/lib/season-server";
import { pageTitle } from "@/lib/site-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const seasonId = await getSeasonId();
  return { title: pageTitle("Civilizations", seasonId) };
}

export default async function CivilizationsPage() {
  const seasonId = await getSeasonId();
  const civs = getCivStats(seasonId).sort(
    (a, b) => b.pick_rate - a.pick_rate,
  );

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
      z: c.games_played,
      fill:
        c.win_rate >= 0.55
          ? "var(--color-chart-1)"
          : c.win_rate >= 0.45
            ? "var(--color-chart-4)"
            : "var(--color-chart-5)",
    }));

  const topPick = civs[0];
  const topWin = [...civs].sort((a, b) => b.win_rate - a.win_rate)[0];
  const avgWr = civs.reduce((s, c) => s + c.win_rate, 0) / civs.length;

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-14">
        <header className="mb-10 anim-fade-up">
          <PageLabel gold>Civilization Analysis</PageLabel>
          <h1 className="font-display text-fluid-2xl font-bold text-primary mt-3">
            {civs.length} Civilizations
          </h1>
          <p className="text-fluid-base text-secondary mt-2 max-w-lg leading-relaxed">
            Pick rates, win rates, and meta from tournament matches in the
            selected season.
          </p>
        </header>

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
            <p className="text-fluid-xs text-muted mt-1">field avg win rate</p>
          </div>
        </div>

        <section className="mb-14 anim-scale-in d2">
          <h2 className="section-label mb-4">Pick Rate vs Win Rate</h2>
          <div className="panel overflow-x-auto min-w-0">
            <MetaScatterChart
              data={scatterData}
              xLabel="Pick rate (%)"
              yLabel="Win rate"
              chartTitle="Meta popularity vs effectiveness"
              mode="pickWinRate100"
            />
          </div>
          <p className="callout mt-4 text-fluid-xs text-secondary">
            Civilizations with fewer than 5 games excluded. Point color: gold
            55%+ WR, teal 45-54%, purple below 45%. Cards below mark gold when
            above field average ({(avgWr * 100).toFixed(1)}%).
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
          <section className="anim-slide-in d3">
            <h2 className="section-label mb-4">Most Picked - Top 15</h2>
            <div className="panel overflow-x-auto min-w-0">
              <RankedHBarChart
                data={pickBars}
                valueFormat="percent1"
                accentColor="var(--color-chart-2)"
                caption="Teal bars = pick share (neutral volume), same palette as Analysis duration bars."
              />
            </div>
          </section>

          <section className="anim-fade-up d4">
            <h2 className="section-label mb-4">Highest Win Rate - Top 15</h2>
            <div className="panel overflow-x-auto min-w-0">
              <RankedHBarChart
                data={winBars}
                maxValue={100}
                valueFormat="percent0"
                caption="Gold: 55%+ win rate. Teal: 45-54%. Muted red: under 45%."
              />
            </div>
          </section>
        </div>

        <div className="divider my-10" />

        <section className="anim-fade-up d5">
          <h2 className="section-label mb-6">All Civilizations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {civs.map((c, i) => {
              const winPct = (c.win_rate * 100).toFixed(1);
              const pickPct = (c.pick_rate * 100).toFixed(1);
              const aboveAvg = c.win_rate > avgWr;
              const rankClass =
                i === 0
                  ? "rank-1"
                  : i === 1
                    ? "rank-2"
                    : i === 2
                      ? "rank-3"
                      : "rank-n";
              return (
                <div
                  key={c.civilization}
                  className="lift rounded-lg border border-ttl-border-subtle bg-ttl-raised px-4 py-3 flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className={`rank-badge ${rankClass}`}>{i + 1}</span>
                    <span className="font-display text-fluid-sm font-bold text-ttl-gold truncate">
                      {c.civilization}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-fluid-xs">
                    <span className="text-muted">{c.games_played}g</span>
                    <span
                      className={
                        aboveAvg
                          ? "text-ttl-gold font-bold"
                          : "text-secondary"
                      }
                    >
                      {winPct}% WR
                    </span>
                    <span className="text-ttl-accent">{pickPct}% pick</span>
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
