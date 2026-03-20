import type { Metadata } from "next";
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
import GroupedBarChart from "@/components/charts/GroupedBarChart";
import MiniBar from "@/components/charts/MiniBar";
import ComparePickers from "@/components/ComparePickers";
import { getSeasonId } from "@/lib/season-server";
import { pageTitle } from "@/lib/site-metadata";

interface Props {
  searchParams: { a?: string; b?: string };
}

export async function generateMetadata(): Promise<Metadata> {
  const seasonId = await getSeasonId();
  return { title: pageTitle("Compare", seasonId) };
}

type WinSide = "a" | "b" | "tie";

function winnerForStat(
  label: string,
  aVal: number,
  bVal: number,
): WinSide {
  if (label === "Games") {
    return "tie";
  }
  if (Math.abs(aVal - bVal) < 1e-9) {
    return "tie";
  }
  return aVal > bVal ? "a" : "b";
}

export default async function ComparePage({ searchParams }: Props) {
  const seasonId = await getSeasonId();
  const playerStats = getPlayerStats(seasonId).sort(
    (a, b) => b.win_rate - a.win_rate,
  );
  const allPlayers = playerStats.map((p) => p.player);
  const nameA = searchParams.a ?? allPlayers[0];
  const nameB = searchParams.b ?? allPlayers[1];

  const advAll = getAdvancedMetrics(seasonId);
  const advA = advAll.find((m) => m.player === nameA);
  const advB = advAll.find((m) => m.player === nameB);
  const h2h = getPlayerH2HPair(seasonId, nameA, nameB);
  const scout = getScoutingReportFor(seasonId, nameA, nameB);
  const affinities = getPlayerMapAffinities(seasonId);
  const clutchAll = getClutchFactors(seasonId);
  const clutchA = clutchAll.find((c) => c.player === nameA);
  const clutchB = clutchAll.find((c) => c.player === nameB);
  const profileA = getPlayerProfile(seasonId, nameA);
  const profileB = getPlayerProfile(seasonId, nameB);

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

  const mapBarRows = sharedMaps.map((map) => {
    const aff = affsA.find((a) => a.map === map);
    const bff = affsB.find((b) => b.map === map);
    const short =
      map.length > 16 ? `${map.slice(0, 15)}..` : map;
    return {
      map: short,
      wrA: aff ? Math.round(aff.map_wr * 1000) / 10 : 0,
      wrB: bff ? Math.round(bff.map_wr * 1000) / 10 : 0,
    };
  });

  const aCivs = profileA
    ? new Set(profileA.civ_preferences.map((c) => c.civilization))
    : new Set<string>();
  const bCivs = profileB
    ? new Set(profileB.civ_preferences.map((c) => c.civilization))
    : new Set<string>();
  const overlap = Array.from(aCivs).filter((c) => bCivs.has(c));
  const aOnly = Array.from(aCivs).filter((c) => !bCivs.has(c));
  const bOnly = Array.from(bCivs).filter((c) => !aCivs.has(c));

  const isAFirst = h2h && h2h.player_a === nameA;

  const statRows: {
    label: string;
    a: string;
    b: string;
    aVal: number;
    bVal: number;
  }[] = [];

  if (advA && advB) {
    statRows.push(
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
        label: "vs. ELO expected",
        a: `${advA.performance_residual >= 0 ? "+" : ""}${(
          advA.performance_residual * 100
        ).toFixed(1)}%`,
        b: `${advB.performance_residual >= 0 ? "+" : ""}${(
          advB.performance_residual * 100
        ).toFixed(1)}%`,
        aVal: advA.performance_residual,
        bVal: advB.performance_residual,
      },
    );
    if (clutchA && clutchB) {
      statRows.push({
        label: "Clutch Delta",
        a: `${clutchA.delta >= 0 ? "+" : ""}${(clutchA.delta * 100).toFixed(
          1,
        )}%`,
        b: `${clutchB.delta >= 0 ? "+" : ""}${(clutchB.delta * 100).toFixed(
          1,
        )}%`,
        aVal: clutchA.delta,
        bVal: clutchB.delta,
      });
    }
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-14">
        <header className="mb-8 anim-fade-up">
          <p className="section-label-gold mb-3">Side by Side</p>
          <h1 className="font-display text-fluid-2xl font-bold text-primary">
            Player Comparison
          </h1>
        </header>

        <ComparePickers
          allPlayers={allPlayers}
          nameA={nameA}
          nameB={nameB}
        />

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
                {advA.performance_tier} - {Math.round(advA.elo)} ELO
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
                {advB.performance_tier} - {Math.round(advB.elo)} ELO
              </p>
            )}
          </div>
        </div>

        {statRows.length > 0 && (
          <div className="panel mb-10 anim-fade-up d2 border border-ttl-border-subtle/60">
            {statRows.map((stat) => {
              const w = winnerForStat(stat.label, stat.aVal, stat.bVal);
              return (
                <div
                  key={stat.label}
                  className="flex items-center py-3 border-b border-ttl-border-subtle/60 last:border-0"
                >
                  <span
                    className={`w-1/3 text-right text-fluid-sm font-bold ${
                      w === "a"
                        ? "text-ttl-gold"
                        : w === "tie"
                          ? "text-secondary"
                          : "text-muted"
                    }`}
                  >
                    {stat.a}
                  </span>
                  <span className="w-1/3 text-center text-fluid-xs text-muted uppercase tracking-wider px-1">
                    {stat.label}
                  </span>
                  <span
                    className={`w-1/3 text-fluid-sm font-bold ${
                      w === "b"
                        ? "text-ttl-gold"
                        : w === "tie"
                          ? "text-secondary"
                          : "text-muted"
                    }`}
                  >
                    {stat.b}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {h2h && (
          <section className="panel mb-10 anim-fade-up d3 border border-ttl-border-subtle/60">
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
              <span>Maps: {h2h.maps_played.split(";").join(", ")}</span>
            </div>
          </section>
        )}

        <div className="space-y-10 mb-14">
          {radarData.length > 2 && (
            <section className="anim-fade-up d4 max-w-xl">
              <h2 className="section-label mb-4">Map Win Rates (shared maps)</h2>
              <div className="panel p-4 border border-ttl-border-subtle/60">
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

          {mapBarRows.length > 0 && (
            <section className="anim-fade-up d4">
              <h2 className="section-label mb-4">
                Shared maps (bar view, % WR)
              </h2>
              <div className="panel p-4 overflow-x-auto border border-ttl-border-subtle/60">
                <GroupedBarChart
                  data={mapBarRows}
                  categoryKey="map"
                  series={[
                    {
                      dataKey: "wrA",
                      name: nameA,
                      color: "var(--color-chart-1)",
                    },
                    {
                      dataKey: "wrB",
                      name: nameB,
                      color: "var(--color-chart-5)",
                    },
                  ]}
                  height={Math.min(520, 120 + mapBarRows.length * 28)}
                  layout="vertical"
                />
              </div>
            </section>
          )}

          <section className="anim-fade-up d5">
            <h2 className="section-label mb-4">Civilization Pools</h2>
            <div className="panel p-5 border border-ttl-border-subtle/60">
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

        {scout && (
          <section className="panel anim-fade-up d6 mb-14 border border-ttl-border-subtle/60">
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
