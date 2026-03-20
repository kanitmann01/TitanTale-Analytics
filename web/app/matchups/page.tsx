import {
  getPlayerH2H,
  getPlayerStats,
  getCivMatchups,
  getPlayerMapAffinities,
  getSpiritCivMatchups,
} from "@/lib/data";
import HeatmapChart from "@/components/charts/HeatmapChart";
import MiniBar from "@/components/charts/MiniBar";

export default function MatchupsPage() {
  const h2h = getPlayerH2H();
  const playerStats = getPlayerStats().sort((a, b) => b.win_rate - a.win_rate);
  const civMatchups = getCivMatchups();
  const affinities = getPlayerMapAffinities();
  const spiritCivs = getSpiritCivMatchups();

  const players = playerStats.map((p) => p.player);

  // H2H heatmap data: value = player_a win fraction in series
  const h2hCells = h2h.map((h) => {
    const aFrac = h.a_game_wins / h.total_games;
    return {
      row: h.player_a,
      col: h.player_b,
      value: aFrac,
      label: `${h.a_game_wins}-${h.b_game_wins}`,
      count: h.total_games,
    };
  });

  // Player-map affinity heatmap
  const topPlayers = players.slice(0, 15);
  const allMaps = Array.from(new Set(affinities.map((a) => a.map))).sort();
  const mapCells = affinities
    .filter((a) => topPlayers.includes(a.player))
    .map((a) => ({
      row: a.player,
      col: a.map,
      value: a.delta + 0.5,
      label: `${a.delta >= 0 ? "+" : ""}${(a.delta * 100).toFixed(0)}%`,
      count: a.map_n,
    }));

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <header className="mb-10 anim-fade-up">
          <p className="section-label-gold mb-3">Head-to-Head</p>
          <h1 className="font-display text-fluid-2xl font-bold text-primary">
            Matchup Explorer
          </h1>
          <p className="text-fluid-base text-secondary mt-2 max-w-lg leading-relaxed">
            Player head-to-head records, civilization matchups, and map affinity
            analysis from {h2h.length} series.
          </p>
        </header>

        {/* Player H2H Grid */}
        <section className="mb-16 anim-fade-up d1">
          <h2 className="section-label mb-4">Player H2H Results</h2>
          <div className="panel p-4">
            <HeatmapChart
              data={h2hCells}
              rows={players}
              cols={players}
              cellSize={38}
              title="Cell shows row player's game wins vs column player. Green = row favored."
            />
          </div>
        </section>

        {/* Player-Map Affinity Heatmap */}
        <section className="mb-16 anim-fade-up d2">
          <h2 className="section-label mb-4">
            Player-Map Affinity (WR delta vs baseline)
          </h2>
          <div className="panel p-4">
            <HeatmapChart
              data={mapCells}
              rows={topPlayers}
              cols={allMaps}
              cellSize={34}
              title="Green = above-baseline WR on this map. Red = below. Hover for game count."
            />
          </div>
        </section>

        {/* Civ Matchup Table */}
        <section className="mb-16 anim-fade-up d3">
          <h2 className="section-label mb-4">Civilization Matchups</h2>
          <div className="panel overflow-x-auto">
            <table className="w-full text-fluid-sm">
              <thead>
                <tr className="border-b border-ttl-border text-left text-muted uppercase tracking-wider text-fluid-xs">
                  <th className="py-2.5 pr-3">Civ A</th>
                  <th className="py-2.5 pr-3">Civ B</th>
                  <th className="py-2.5 pr-3 text-right">Games</th>
                  <th className="py-2.5 pr-3 text-right">A Win Rate</th>
                  <th className="py-2.5 pr-3 w-28">Balance</th>
                  <th className="py-2.5 text-right">Avg Dur.</th>
                </tr>
              </thead>
              <tbody>
                {civMatchups.slice(0, 25).map((cm) => {
                  const spiritMatch = spiritCivs.find(
                    (s) =>
                      (s.civ_a === cm.civilization1 && s.civ_b === cm.civilization2) ||
                      (s.civ_a === cm.civilization2 && s.civ_b === cm.civilization1),
                  );
                  const lowN = cm.games_played < 3;
                  return (
                    <tr
                      key={`${cm.civilization1}-${cm.civilization2}`}
                      className={`border-b border-ttl-border-subtle/60 transition-colors ${
                        lowN ? "opacity-50" : "hover:bg-ttl-slate/40"
                      }`}
                    >
                      <td className="py-2.5 pr-3 text-primary font-medium">
                        {cm.civilization1}
                      </td>
                      <td className="py-2.5 pr-3 text-primary font-medium">
                        {cm.civilization2}
                      </td>
                      <td className="py-2.5 pr-3 text-right text-secondary">
                        {cm.games_played}
                        {lowN && (
                          <span className="text-muted ml-1 text-fluid-xs">*</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-3 text-right">
                        <span
                          className={
                            cm.civ1_win_rate > 0.6
                              ? "text-ttl-gold font-bold"
                              : cm.civ1_win_rate < 0.4
                              ? "text-ttl-loss"
                              : "text-secondary"
                          }
                        >
                          {(cm.civ1_win_rate * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="py-2.5 pr-3">
                        <MiniBar
                          value={1 - Math.abs(cm.civ1_win_rate - 0.5) * 2}
                          color={
                            Math.abs(cm.civ1_win_rate - 0.5) < 0.1
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
              * = fewer than 3 games. No civ matchup reached statistical
              significance (p &lt; 0.05). Data is sparse across 39 civs.
            </p>
          </div>
        </section>

        {/* H2H Detail Cards */}
        <section className="anim-fade-up d4">
          <h2 className="section-label mb-5">Series Detail</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {h2h.slice(0, 12).map((h) => (
              <div
                key={`${h.player_a}-${h.player_b}`}
                className="lift panel hover:border-ttl-border transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-fluid-sm text-primary font-bold">
                    {h.player_a}
                  </span>
                  <span className="text-fluid-lg font-display font-bold text-ttl-gold">
                    {h.a_game_wins}-{h.b_game_wins}
                  </span>
                  <span className="text-fluid-sm text-primary font-bold">
                    {h.player_b}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <MiniBar
                    value={h.a_game_wins / h.total_games}
                    color={
                      h.series_winner === h.player_a
                        ? "var(--color-chart-4)"
                        : "var(--color-chart-5)"
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-fluid-xs text-muted">
                  <div>
                    <span className="uppercase tracking-wider block mb-0.5">
                      Duration
                    </span>
                    <span className="text-secondary">{h.avg_duration}m avg</span>
                  </div>
                  <div>
                    <span className="uppercase tracking-wider block mb-0.5">
                      Maps
                    </span>
                    <span className="text-secondary truncate block">
                      {h.maps_played.split(";").slice(0, 3).join(", ")}
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
