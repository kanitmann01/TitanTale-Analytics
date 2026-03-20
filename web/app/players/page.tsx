import Link from "next/link";
import { getPlayerStats, getPlayers } from "@/lib/data";
import HBarChart from "@/components/charts/HBarChart";
import ScatterChart from "@/components/charts/ScatterChart";
import MiniBar from "@/components/charts/MiniBar";

export default function PlayersPage() {
  const players = getPlayerStats().sort((a, b) => b.win_rate - a.win_rate);
  const roster = getPlayers();

  const scatterData = players
    .filter((p) => p.elo !== null)
    .map((p) => ({
      label: p.player,
      x: p.elo!,
      y: p.win_rate,
      size: Math.max(3, Math.min(p.total_games / 6, 9)),
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
      <div className="max-w-6xl mx-auto px-6 py-14">
        <header className="mb-10 anim-fade-up">
          <p className="section-label-gold mb-3">Player Rankings</p>
          <h1 className="font-display text-fluid-2xl font-bold text-primary">
            {players.length} Competitors
          </h1>
          <p className="text-fluid-base text-secondary mt-2 max-w-lg leading-relaxed">
            Ranked by win rate. Dot size in the scatter plot reflects total games
            played.
          </p>
        </header>

        {/* Featured #1 player callout */}
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

        {/* Charts -- varied framing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-18">
          <section className="anim-scale-in d2">
            <h2 className="section-label mb-4">
              ELO vs Win Rate
            </h2>
            <div className="panel">
              <ScatterChart
                data={scatterData}
                xLabel="ELO Rating"
                yLabel="Win Rate"
              />
            </div>
          </section>

          <section className="anim-slide-in d3">
            <h2 className="section-label mb-4">
              Win Rate -- Top 12
            </h2>
            <div className="panel-flush p-5">
              <HBarChart
                data={barData}
                maxValue={100}
                formatValue={(v) => `${v.toFixed(0)}%`}
              />
            </div>
          </section>
        </div>

        <div className="divider my-12" />

        {/* Full table */}
        <section className="anim-fade-up d4">
          <h2 className="section-label mb-5">
            Full Rankings
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-fluid-sm">
              <thead>
                <tr className="border-b border-ttl-border text-left text-muted uppercase tracking-wider text-fluid-xs">
                  <th className="py-3 pr-3 w-8">#</th>
                  <th className="py-3 pr-4">Player</th>
                  <th className="py-3 pr-4 hidden xl:table-cell">Team</th>
                  <th className="py-3 pr-4 w-32 hidden md:table-cell">Win Rate</th>
                  <th className="py-3 pr-4 text-right">WR%</th>
                  <th className="py-3 pr-4 text-right">W-L</th>
                  <th className="py-3 pr-4 text-right hidden sm:table-cell">Games</th>
                  <th className="py-3 pr-4 text-right hidden lg:table-cell">ELO</th>
                  <th className="py-3 pr-4 text-right hidden lg:table-cell">Civs</th>
                  <th className="py-3 text-right hidden xl:table-cell">Avg Dur.</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p, i) => {
                  const rankClass =
                    i === 0 ? "rank-1" : i === 1 ? "rank-2" : i === 2 ? "rank-3" : "rank-n";
                  return (
                    <tr
                      key={p.player}
                      className={`border-b border-ttl-border-subtle/60 hover:bg-ttl-slate/40 transition-colors ${
                        i < 3 ? "bg-ttl-raised/30" : ""
                      }`}
                    >
                      <td className="py-3 pr-3">
                        <span className={`rank-badge ${rankClass}`}>{i + 1}</span>
                      </td>
                      <td className="py-3 pr-4 font-medium text-primary">
                        <Link
                          href={`/players/${encodeURIComponent(p.player)}`}
                          className="hover:text-ttl-gold transition-colors"
                        >
                          {p.player}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-secondary text-fluid-xs hidden xl:table-cell">
                        {roster.find((r) => r.player_name === p.player)?.team ?? "--"}
                      </td>
                      <td className="py-3 pr-4 hidden md:table-cell">
                        <MiniBar
                          value={p.win_rate}
                          color={
                            p.win_rate >= 0.6
                              ? "var(--color-chart-1)"
                              : p.win_rate >= 0.5
                              ? "var(--color-chart-2)"
                              : "var(--color-text-muted)"
                          }
                          className="w-full"
                        />
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <span
                          className={
                            p.win_rate >= 0.6
                              ? "text-ttl-gold font-bold"
                              : p.win_rate >= 0.5
                              ? "text-primary"
                              : "text-muted"
                          }
                        >
                          {(p.win_rate * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-right text-secondary">
                        <span className="text-ttl-win">{p.wins}</span>
                        <span className="text-muted">-</span>
                        <span className="text-ttl-loss">{p.losses}</span>
                      </td>
                      <td className="py-3 pr-4 text-right text-secondary hidden sm:table-cell">
                        {p.total_games}
                      </td>
                      <td className="py-3 pr-4 text-right text-muted hidden lg:table-cell">
                        {p.elo ? Math.round(p.elo) : "--"}
                      </td>
                      <td className="py-3 pr-4 text-right text-secondary hidden lg:table-cell">
                        {p.unique_civs}
                      </td>
                      <td className="py-3 text-right text-muted hidden xl:table-cell">
                        {p.avg_game_duration.toFixed(1)}m
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
