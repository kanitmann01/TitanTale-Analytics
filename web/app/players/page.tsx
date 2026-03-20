import type { Metadata } from "next";
import { getPlayerStats, getPlayers } from "@/lib/data";
import MetaScatterChart from "@/components/charts/MetaScatterChart";
import RankedHBarChart from "@/components/charts/RankedHBarChart";
import PlayersRankingsTable from "@/components/PlayersRankingsTable";
import { getSeasonId } from "@/lib/season-server";
import StatHelp from "@/components/StatHelp";
import { STAT_HELP, helpAria } from "@/lib/stat-tooltips";
import { pageTitle } from "@/lib/site-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const seasonId = await getSeasonId();
  return { title: pageTitle("Players", seasonId) };
}

export default async function PlayersPage() {
  const seasonId = await getSeasonId();
  const players = getPlayerStats(seasonId).sort(
    (a, b) => b.win_rate - a.win_rate,
  );
  const roster = getPlayers(seasonId);

  const scatterData = players
    .filter((p) => p.elo !== null)
    .map((p) => ({
      label: p.player,
      x: p.elo!,
      y: p.win_rate,
      z: p.total_games,
      fill:
        p.win_rate >= 0.6
          ? "var(--color-chart-1)"
          : p.win_rate >= 0.5
            ? "var(--color-chart-4)"
            : "var(--color-chart-5)",
    }));

  const barData = players.slice(0, 12).map((p) => ({
    label: p.player,
    value: p.win_rate * 100,
    color:
      p.win_rate >= 0.6
        ? "var(--color-chart-1)"
        : p.win_rate >= 0.5
          ? "var(--color-chart-2)"
          : "var(--color-text-muted)",
  }));

  const top = players[0];

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-14">
        <header className="mb-10 anim-fade-up">
          <p className="section-label-gold mb-3">Player Rankings</p>
          <h1 className="font-display text-fluid-2xl font-bold text-primary">
            {players.length} Competitors
          </h1>
          <p className="text-fluid-base text-secondary mt-2 max-w-lg leading-relaxed">
            Ranked by win rate. Hover scatter points for ELO, win rate, and games.
          </p>
        </header>

        <div className="callout mb-12 anim-slide-in d1">
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
            <span className="font-display text-fluid-lg font-bold text-ttl-gold">
              {top.player}
            </span>
            <span className="text-fluid-sm text-primary font-medium">
              {(top.win_rate * 100).toFixed(1)}% win rate
            </span>
            <span className="text-fluid-xs text-secondary">
              {top.wins}W-{top.losses}L across {top.total_games} games
            </span>
            {top.elo && (
              <span className="text-fluid-xs text-muted">
                {Math.round(top.elo)} ELO
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-18">
          <section className="anim-scale-in d2">
            <h2 className="section-label mb-4 flex flex-wrap items-center gap-1">
              ELO vs Win Rate
              <StatHelp
                text={STAT_HELP.playersEloVsWinScatter}
                ariaLabel={helpAria("ELO vs Win Rate")}
              />
            </h2>
            <div className="panel overflow-x-auto min-w-0">
              <MetaScatterChart
                data={scatterData}
                xLabel="ELO Rating"
                yLabel="Win Rate"
                chartTitle="Skill vs results"
                mode="eloWinRate"
              />
            </div>
            <p className="callout mt-4 text-fluid-xs text-secondary">
              Hover points for full stats. Gold / teal / purple encode win-rate
              tier; larger points mean more games (same chart system as
              Analysis).
            </p>
          </section>

          <section className="anim-slide-in d3">
            <h2 className="section-label mb-4">Win Rate - Top 12</h2>
            <div className="panel overflow-x-auto min-w-0">
              <RankedHBarChart
                data={barData}
                maxValue={100}
                valueFormat="percent0"
                accentColor="var(--color-chart-2)"
                caption="Gold: 60%+ win rate. Teal: 50-59%. Muted: under 50%."
              />
            </div>
          </section>
        </div>

        <div className="divider my-12" />

        <section className="anim-fade-up d4">
          <h2 className="h2-section font-display text-fluid-lg font-bold text-primary mb-1 flex flex-wrap items-center gap-1">
            Full Rankings
            <StatHelp
              text={STAT_HELP.playersFullRankings}
              ariaLabel={helpAria("Full Rankings")}
            />
          </h2>
          <p className="text-fluid-xs text-muted mb-5 max-w-xl">
            Click column headers to sort. Win rate column combines bar and
            percentage.
          </p>
          <PlayersRankingsTable players={players} roster={roster} />
        </section>
      </div>
    </main>
  );
}
