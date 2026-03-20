import Link from "next/link";
import {
  getPlayerStats,
  getPlayerH2HPair,
  getAdvancedMetrics,
  getScoutingReportFor,
  getPlayerMapAffinities,
  getClutchFactors,
  getPlayerProfile,
} from "@/lib/data";
import RadarCompare from "@/components/charts/RadarCompare";
import MiniBar from "@/components/charts/MiniBar";

interface Props {
  searchParams: { a?: string; b?: string };
}

export default function ComparePage({ searchParams }: Props) {
  const playerStats = getPlayerStats().sort((a, b) => b.win_rate - a.win_rate);
  const allPlayers = playerStats.map((p) => p.player);
  const nameA = searchParams.a ?? allPlayers[0];
  const nameB = searchParams.b ?? allPlayers[1];

  const advAll = getAdvancedMetrics();
  const advA = advAll.find((m) => m.player === nameA);
  const advB = advAll.find((m) => m.player === nameB);
  const h2h = getPlayerH2HPair(nameA, nameB);
  const scout = getScoutingReportFor(nameA, nameB);
  const affinities = getPlayerMapAffinities();
  const clutchAll = getClutchFactors();
  const clutchA = clutchAll.find((c) => c.player === nameA);
  const clutchB = clutchAll.find((c) => c.player === nameB);
  const profileA = getPlayerProfile(nameA);
  const profileB = getPlayerProfile(nameB);

  // Radar data: maps where both players have data
  const affsA = affinities.filter((a) => a.player === nameA);
  const affsB = affinities.filter((a) => a.player === nameB);
  const sharedMaps = affsA
    .filter((a) => affsB.some((b) => b.map === a.map))
    .map((a) => a.map);

  const radarData = sharedMaps.map((map) => {
    const aff = affsA.find((a) => a.map === map);
    const bff = affsB.find((b) => b.map === map);
    return {
      axis: map,
      [nameA]: aff ? Math.max(0, aff.map_wr) : 0,
      [nameB]: bff ? Math.max(0, bff.map_wr) : 0,
    };
  });

  // Civ overlap
  const aCivs = profileA
    ? new Set(profileA.civ_preferences.map((c) => c.civilization))
    : new Set<string>();
  const bCivs = profileB
    ? new Set(profileB.civ_preferences.map((c) => c.civilization))
    : new Set<string>();
  const overlap = Array.from(aCivs).filter((c) => bCivs.has(c));
  const aOnly = Array.from(aCivs).filter((c) => !bCivs.has(c));
  const bOnly = Array.from(bCivs).filter((c) => !aCivs.has(c));

  // H2H details
  const isAFirst = h2h && h2h.player_a === nameA;

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <header className="mb-8 anim-fade-up">
          <p className="section-label-gold mb-3">Side by Side</p>
          <h1 className="font-display text-fluid-2xl font-bold text-primary">
            Player Comparison
          </h1>
        </header>

        {/* Player picker */}
        <div className="flex flex-wrap items-center gap-4 mb-10">
          <div className="flex flex-wrap gap-2">
            {allPlayers.map((p) => (
              <Link
                key={`a-${p}`}
                href={`/compare?a=${encodeURIComponent(p)}&b=${encodeURIComponent(nameB)}`}
                className={`text-fluid-xs px-2.5 py-1 rounded transition-colors ${
                  p === nameA
                    ? "bg-ttl-gold/20 text-ttl-gold border border-ttl-gold/30 font-bold"
                    : "text-muted hover:text-secondary border border-transparent"
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
          <span className="text-fluid-lg text-muted font-display font-bold">
            vs
          </span>
          <div className="flex flex-wrap gap-2">
            {allPlayers.map((p) => (
              <Link
                key={`b-${p}`}
                href={`/compare?a=${encodeURIComponent(nameA)}&b=${encodeURIComponent(p)}`}
                className={`text-fluid-xs px-2.5 py-1 rounded transition-colors ${
                  p === nameB
                    ? "bg-ttl-accent/20 text-ttl-accent border border-ttl-accent/30 font-bold"
                    : "text-muted hover:text-secondary border border-transparent"
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        </div>

        {/* Stat comparison */}
        <div className="grid grid-cols-3 gap-4 mb-10 anim-slide-in d1">
          <div className="text-right">
            <Link
              href={`/players/${encodeURIComponent(nameA)}`}
              className="font-display text-fluid-xl font-bold text-ttl-gold hover:text-ttl-gold-light transition-colors"
            >
              {nameA}
            </Link>
            {advA && (
              <p className="text-fluid-xs text-muted mt-1">
                {advA.performance_tier} -- {Math.round(advA.elo)} ELO
              </p>
            )}
          </div>
          <div className="text-center text-muted text-fluid-sm self-center">
            vs
          </div>
          <div>
            <Link
              href={`/players/${encodeURIComponent(nameB)}`}
              className="font-display text-fluid-xl font-bold text-ttl-accent hover:text-ttl-accent/80 transition-colors"
            >
              {nameB}
            </Link>
            {advB && (
              <p className="text-fluid-xs text-muted mt-1">
                {advB.performance_tier} -- {Math.round(advB.elo)} ELO
              </p>
            )}
          </div>
        </div>

        {/* Side by side stats */}
        {advA && advB && (
          <div className="panel mb-10 anim-fade-up d2">
            {[
              {
                label: "Win Rate",
                a: `${(advA.win_rate * 100).toFixed(1)}%`,
                b: `${(advB.win_rate * 100).toFixed(1)}%`,
                aVal: advA.win_rate,
                bVal: advB.win_rate,
              },
              {
                label: "Games",
                a: String(advA.total_games),
                b: String(advB.total_games),
                aVal: advA.total_games,
                bVal: advB.total_games,
              },
              {
                label: "Civ Diversity",
                a: `${(advA.civ_diversity * 100).toFixed(0)}%`,
                b: `${(advB.civ_diversity * 100).toFixed(0)}%`,
                aVal: advA.civ_diversity,
                bVal: advB.civ_diversity,
              },
              {
                label: "ELO Residual",
                a: `${advA.performance_residual >= 0 ? "+" : ""}${(
                  advA.performance_residual * 100
                ).toFixed(1)}%`,
                b: `${advB.performance_residual >= 0 ? "+" : ""}${(
                  advB.performance_residual * 100
                ).toFixed(1)}%`,
                aVal: advA.performance_residual,
                bVal: advB.performance_residual,
              },
              ...(clutchA && clutchB
                ? [
                    {
                      label: "Clutch Delta",
                      a: `${clutchA.delta >= 0 ? "+" : ""}${(
                        clutchA.delta * 100
                      ).toFixed(1)}%`,
                      b: `${clutchB.delta >= 0 ? "+" : ""}${(
                        clutchB.delta * 100
                      ).toFixed(1)}%`,
                      aVal: clutchA.delta,
                      bVal: clutchB.delta,
                    },
                  ]
                : []),
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center py-3 border-b border-ttl-border-subtle/60 last:border-0"
              >
                <span
                  className={`w-1/3 text-right text-fluid-sm font-bold ${
                    stat.aVal > stat.bVal ? "text-ttl-gold" : "text-secondary"
                  }`}
                >
                  {stat.a}
                </span>
                <span className="w-1/3 text-center text-fluid-xs text-muted uppercase tracking-wider">
                  {stat.label}
                </span>
                <span
                  className={`w-1/3 text-fluid-sm font-bold ${
                    stat.bVal > stat.aVal ? "text-ttl-accent" : "text-secondary"
                  }`}
                >
                  {stat.b}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* H2H record */}
        {h2h && (
          <section className="panel mb-10 anim-fade-up d3">
            <h2 className="section-label mb-4">Head-to-Head Record</h2>
            <div className="flex items-center justify-between mb-3">
              <span className="text-fluid-lg font-display font-bold text-ttl-gold">
                {isAFirst ? h2h.a_game_wins : h2h.b_game_wins}
              </span>
              <span className="text-fluid-xs text-muted">
                {h2h.total_games} games played
              </span>
              <span className="text-fluid-lg font-display font-bold text-ttl-accent">
                {isAFirst ? h2h.b_game_wins : h2h.a_game_wins}
              </span>
            </div>
            <MiniBar
              value={
                isAFirst
                  ? h2h.a_game_wins / h2h.total_games
                  : h2h.b_game_wins / h2h.total_games
              }
              color={
                h2h.series_winner === nameA
                  ? "var(--color-chart-1)"
                  : "var(--color-chart-5)"
              }
            />
            <div className="flex justify-between text-fluid-xs text-muted mt-3">
              <span>Avg: {h2h.avg_duration}m</span>
              <span>
                Maps: {h2h.maps_played.split(";").join(", ")}
              </span>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
          {/* Map affinity radar */}
          {radarData.length > 2 && (
            <section className="anim-fade-up d4">
              <h2 className="section-label mb-4">
                Map Win Rates (shared maps)
              </h2>
              <div className="panel p-4">
                <RadarCompare
                  data={radarData}
                  players={[
                    {
                      dataKey: nameA,
                      name: nameA,
                      color: "var(--color-chart-1)",
                    },
                    {
                      dataKey: nameB,
                      name: nameB,
                      color: "var(--color-chart-5)",
                    },
                  ]}
                />
              </div>
            </section>
          )}

          {/* Civ overlap */}
          <section className="anim-fade-up d5">
            <h2 className="section-label mb-4">Civilization Pools</h2>
            <div className="panel p-5">
              <div className="mb-4">
                <p className="text-fluid-xs text-muted uppercase tracking-wider mb-2">
                  Shared ({overlap.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {overlap.map((c) => (
                    <span
                      key={c}
                      className="text-fluid-xs text-secondary bg-ttl-slate/60 px-2 py-0.5 rounded"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-fluid-xs text-ttl-gold mb-2">
                    Only {nameA} ({aOnly.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {aOnly.map((c) => (
                      <span
                        key={c}
                        className="text-fluid-xs text-ttl-gold/80 bg-ttl-gold/10 px-2 py-0.5 rounded"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-fluid-xs text-ttl-accent mb-2">
                    Only {nameB} ({bOnly.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {bOnly.map((c) => (
                      <span
                        key={c}
                        className="text-fluid-xs text-ttl-accent/80 bg-ttl-accent/10 px-2 py-0.5 rounded"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Scouting report */}
        {scout && (
          <section className="panel anim-fade-up d6 mb-14">
            <h2 className="section-label mb-4">Scouting Report</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-fluid-xs text-muted uppercase tracking-wider mb-2">
                  {nameA}&apos;s best maps
                </p>
                <p className="text-fluid-sm text-secondary">
                  {scout.a_best_maps
                    ? scout.a_best_maps.split(";").join(", ")
                    : "None identified"}
                </p>

                <p className="text-fluid-xs text-muted uppercase tracking-wider mt-4 mb-2">
                  {nameA}&apos;s weak maps
                </p>
                <p className="text-fluid-sm text-secondary">
                  {scout.a_weak_maps
                    ? scout.a_weak_maps.split(";").join(", ")
                    : "None identified"}
                </p>
              </div>
              <div>
                <p className="text-fluid-xs text-muted uppercase tracking-wider mb-2">
                  {nameB}&apos;s best maps
                </p>
                <p className="text-fluid-sm text-secondary">
                  {scout.b_best_maps
                    ? scout.b_best_maps.split(";").join(", ")
                    : "None identified"}
                </p>

                <p className="text-fluid-xs text-muted uppercase tracking-wider mt-4 mb-2">
                  Contested maps
                </p>
                <p className="text-fluid-sm text-secondary">
                  {scout.contested_maps
                    ? scout.contested_maps.split(";").join(", ")
                    : "None identified"}
                </p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-ttl-border-subtle">
              <div className="flex flex-wrap gap-6 text-fluid-xs">
                <div>
                  <span className="text-muted">ELO edge: </span>
                  <span className="text-primary font-medium">
                    {scout.elo_edge}
                  </span>
                </div>
                <div>
                  <span className="text-muted">Upset probability: </span>
                  <span className="text-primary font-medium">
                    {(scout.upset_probability * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
