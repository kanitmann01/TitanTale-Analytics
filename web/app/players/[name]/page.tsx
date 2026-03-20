import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getPlayerProfile,
  getPlayerStats,
  getPlayers,
  getAdvancedMetricsFor,
  getPlayerH2HFor,
  getPlayerMapAffinityFor,
  getClutchFactors,
} from "@/lib/data";
import MiniBar from "@/components/charts/MiniBar";
import HBarChart from "@/components/charts/HBarChart";
import StatHelp from "@/components/StatHelp";
import { STAT_HELP, helpAria } from "@/lib/stat-tooltips";
import CompareShortcut from "@/components/CompareShortcut";
import { getSeasonId } from "@/lib/season-server";
import { pageTitle } from "@/lib/site-metadata";
import { displayTeamName } from "@/lib/team-display";

export const dynamic = "force-dynamic";

interface Props {
  params: { name: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const seasonId = await getSeasonId();
  const playerName = decodeURIComponent(params.name);
  const profile = getPlayerProfile(seasonId, playerName);
  if (!profile) {
    return { title: "Player | TTL Stats" };
  }
  return { title: pageTitle(profile.player_name, seasonId) };
}

export default async function PlayerProfilePage({ params }: Props) {
  const seasonId = await getSeasonId();
  const playerName = decodeURIComponent(params.name);
  const profile = getPlayerProfile(seasonId, playerName);
  if (!profile) {
    notFound();
  }

  const roster = getPlayers(seasonId).find((p) => p.player_name === playerName);
  const advanced = getAdvancedMetricsFor(seasonId, playerName);
  const h2hRecords = getPlayerH2HFor(seasonId, playerName);
  const mapAffinities = getPlayerMapAffinityFor(seasonId, playerName).sort(
    (a, b) => b.delta - a.delta,
  );
  const clutch = getClutchFactors(seasonId).find((c) => c.player === playerName);

  const civBars = profile.civ_preferences.slice(0, 12).map((c) => ({
    label: c.civilization,
    value: c.win_rate * 100,
    color:
      c.win_rate >= 0.8
        ? "var(--color-chart-4)"
        : c.win_rate >= 0.6
          ? "var(--color-chart-1)"
          : c.win_rate >= 0.5
            ? "var(--color-chart-3)"
            : "var(--color-text-muted)",
  }));

  const bestMaps = mapAffinities.filter((a) => a.delta > 0).slice(0, 5);
  const worstMaps = mapAffinities
    .filter((a) => a.delta < -0.1)
    .slice(-5)
    .reverse();

  const teamShown = displayTeamName(roster?.team ?? null);
  const allPlayers = getPlayerStats(seasonId).map((p) => p.player);
  const compareOthers = allPlayers.filter((p) => p !== playerName).sort();

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-14">
        <Link
          href="/players"
          className="text-fluid-xs text-ttl-accent hover:text-ttl-gold transition-colors mb-6 inline-block"
        >
          &larr; All players
        </Link>

        <header className="mb-10 anim-fade-up">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <h1 className="font-display text-fluid-2xl font-bold text-primary">
              {profile.player_name}
            </h1>
            {roster?.country && (
              <span className="text-fluid-sm text-muted">{roster.country}</span>
            )}
            {teamShown && (
              <span className="text-fluid-sm text-ttl-accent">{teamShown}</span>
            )}
          </div>
          {advanced && (
            <span
              className={`inline-block mt-2 text-fluid-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${
                advanced.performance_tier === "Elite"
                  ? "bg-ttl-gold/10 text-ttl-gold border-ttl-gold/30"
                  : advanced.performance_tier === "Strong"
                    ? "bg-ttl-win/10 text-ttl-win border-ttl-win/30"
                    : advanced.performance_tier === "Struggling"
                      ? "bg-ttl-loss/10 text-ttl-loss border-ttl-loss/30"
                      : "bg-ttl-slate/40 text-secondary border-ttl-border-subtle"
              }`}
            >
              {advanced.performance_tier}
            </span>
          )}
          <CompareShortcut selfName={playerName} opponents={compareOthers} />
        </header>

        <div className="flex flex-wrap gap-x-10 gap-y-4 mb-10 anim-slide-in d1">
          <div>
            <p className="text-fluid-xl font-display font-bold text-ttl-gold leading-none">
              {(profile.win_rate * 100).toFixed(1)}%
            </p>
            <p className="text-fluid-xs text-muted mt-1 inline-flex items-center gap-1">
              win rate
              <StatHelp
                text={STAT_HELP.winRate}
                ariaLabel={helpAria("Win rate")}
              />
            </p>
          </div>
          <div>
            <p className="text-fluid-xl font-display font-bold text-primary leading-none">
              {profile.wins}
              <span className="text-muted">-</span>
              {profile.losses}
            </p>
            <p className="text-fluid-xs text-muted mt-1 inline-flex items-center gap-1">
              record
              <StatHelp
                text={STAT_HELP.winLossRecord}
                ariaLabel={helpAria("Record")}
              />
            </p>
          </div>
          {profile.elo && (
            <div>
              <p className="text-fluid-xl font-display font-bold text-primary leading-none">
                {Math.round(profile.elo)}
              </p>
              <p className="text-fluid-xs text-muted mt-1 inline-flex items-center gap-1">
                ELO
                <StatHelp text={STAT_HELP.elo} ariaLabel={helpAria("ELO")} />
              </p>
            </div>
          )}
          <div>
            <p className="text-fluid-xl font-display font-bold text-primary leading-none">
              {profile.unique_civs}
            </p>
            <p className="text-fluid-xs text-muted mt-1 inline-flex items-center gap-1">
              unique civs
              <StatHelp
                text={STAT_HELP.uniqueCivs}
                ariaLabel={helpAria("Unique civs")}
              />
            </p>
          </div>
          {clutch && (
            <div>
              <p
                className={`text-fluid-xl font-display font-bold leading-none ${
                  clutch.delta >= 0 ? "text-ttl-win" : "text-ttl-loss"
                }`}
              >
                {clutch.delta >= 0 ? "+" : ""}
                {(clutch.delta * 100).toFixed(1)}%
              </p>
              <p className="text-fluid-xs text-muted mt-1 inline-flex items-center gap-1">
                clutch delta
                <StatHelp
                  text={STAT_HELP.clutchDelta}
                  ariaLabel={helpAria("Clutch delta")}
                />
              </p>
            </div>
          )}
          {advanced && (
            <div>
              <p
                className={`text-fluid-xl font-display font-bold leading-none ${
                  advanced.performance_residual >= 0
                    ? "text-ttl-gold"
                    : "text-ttl-loss"
                }`}
              >
                {advanced.performance_residual >= 0 ? "+" : ""}
                {(advanced.performance_residual * 100).toFixed(1)}%
              </p>
              <p className="text-fluid-xs text-muted mt-1 inline-flex items-center gap-1">
                vs. ELO expected
                <StatHelp
                  text={STAT_HELP.vsEloExpected}
                  ariaLabel={helpAria("vs. ELO expected")}
                />
              </p>
            </div>
          )}
        </div>

        <div className="divider mb-10" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
          <section className="anim-fade-up d2">
            <h2 className="section-label mb-4 flex flex-wrap items-center gap-1">
              Civilization Performance (top 12)
              <StatHelp
                text={STAT_HELP.sectionCivPerformance}
                ariaLabel={helpAria("Civilization Performance")}
              />
            </h2>
            <div className="panel-flush p-5 overflow-x-auto border border-ttl-border-subtle/60">
              <HBarChart
                data={civBars}
                maxValue={100}
                formatValue={(v) => `${v.toFixed(0)}%`}
              />
            </div>
          </section>

          <section className="anim-fade-up d3">
            <h2 className="section-label mb-4 flex flex-wrap items-center gap-1">
              Map Affinities
              <StatHelp
                text={STAT_HELP.sectionMapAffinities}
                ariaLabel={helpAria("Map Affinities")}
              />
            </h2>
            <div className="space-y-1">
              <p className="text-fluid-xs text-muted uppercase tracking-wider mb-2 inline-flex items-center gap-1 flex-wrap">
                Best maps (WR above baseline)
                <StatHelp
                  text={STAT_HELP.bestMapsLabel}
                  ariaLabel={helpAria("Best maps")}
                />
              </p>
              {bestMaps.map((a) => (
                <div
                  key={a.map}
                  className="flex items-center justify-between panel-inset bg-ttl-win/5 border-ttl-win/15"
                >
                  <span className="text-fluid-sm text-primary font-medium">
                    {a.map}
                  </span>
                  <div className="flex gap-3 text-fluid-xs">
                    <span className="text-ttl-win font-bold">
                      +{(a.delta * 100).toFixed(0)}%
                    </span>
                    <span className="text-muted">
                      {(a.map_wr * 100).toFixed(0)}% on {a.map_n}g
                    </span>
                  </div>
                </div>
              ))}
              {worstMaps.length > 0 && (
                <>
                  <p className="text-fluid-xs text-muted uppercase tracking-wider mt-4 mb-2 inline-flex items-center gap-1 flex-wrap">
                    Weak maps (WR below baseline)
                    <StatHelp
                      text={STAT_HELP.weakMapsLabel}
                      ariaLabel={helpAria("Weak maps")}
                    />
                  </p>
                  {worstMaps.map((a) => (
                    <div
                      key={a.map}
                      className="flex items-center justify-between panel-inset bg-ttl-loss/5 border-ttl-loss/15"
                    >
                      <span className="text-fluid-sm text-primary font-medium">
                        {a.map}
                      </span>
                      <div className="flex gap-3 text-fluid-xs">
                        <span className="text-ttl-loss font-bold">
                          {(a.delta * 100).toFixed(0)}%
                        </span>
                        <span className="text-muted">
                          {(a.map_wr * 100).toFixed(0)}% on {a.map_n}g
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </section>
        </div>

        <section className="mb-14 anim-fade-up d4">
          <h2 className="section-label mb-5 flex flex-wrap items-center gap-1">
            Head-to-Head Records
            <StatHelp
              text={STAT_HELP.sectionH2HRecords}
              ariaLabel={helpAria("Head-to-Head Records")}
            />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {h2hRecords.map((h) => {
              const isA = h.player_a === playerName;
              const opponent = isA ? h.player_b : h.player_a;
              const myWins = isA ? h.a_game_wins : h.b_game_wins;
              const won = h.series_winner === playerName;
              const share = myWins / h.total_games;
              return (
                <Link
                  key={opponent}
                  href={`/compare?a=${encodeURIComponent(playerName)}&b=${encodeURIComponent(opponent)}`}
                  className="lift panel hover:border-ttl-border transition-colors border border-ttl-border-subtle/60"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-fluid-sm text-muted">vs</span>
                    <span className="text-fluid-sm text-primary font-bold">
                      {opponent}
                    </span>
                    <span
                      className={`text-fluid-lg font-display font-bold ${
                        won ? "text-ttl-win" : "text-ttl-loss"
                      }`}
                    >
                      {myWins}-{isA ? h.b_game_wins : h.a_game_wins}
                    </span>
                  </div>
                  <MiniBar
                    value={share}
                    color={
                      share >= 0.55
                        ? "var(--color-chart-4)"
                        : share >= 0.45
                          ? "var(--color-chart-3)"
                          : "var(--color-chart-5)"
                    }
                  />
                  <div className="flex justify-between text-fluid-xs text-muted mt-1.5">
                    <span>{h.avg_duration}m avg</span>
                    <span>{h.total_games} games</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="anim-fade-up d5">
          <h2 className="section-label mb-5 flex flex-wrap items-center gap-1">
            Recent Matches
            <StatHelp
              text={STAT_HELP.sectionRecentMatches}
              ariaLabel={helpAria("Recent Matches")}
            />
          </h2>
          <div className="overflow-x-auto min-w-0">
            <table className="w-full text-fluid-sm min-w-[520px]">
              <thead>
                <tr className="border-b border-ttl-border text-left text-muted uppercase tracking-wider text-fluid-xs">
                  <th className="py-2.5 pr-3">
                    <span className="inline-flex items-center gap-1">
                      Series
                      <StatHelp
                        text={STAT_HELP.thSeries}
                        ariaLabel={helpAria("Series")}
                      />
                    </span>
                  </th>
                  <th className="py-2.5 pr-3">
                    <span className="inline-flex items-center gap-1">
                      Result
                      <StatHelp
                        text={STAT_HELP.thResult}
                        ariaLabel={helpAria("Result")}
                      />
                    </span>
                  </th>
                  <th className="py-2.5 pr-3">
                    <span className="inline-flex items-center gap-1">
                      Opponent
                      <StatHelp
                        text={STAT_HELP.thOpponent}
                        ariaLabel={helpAria("Opponent")}
                      />
                    </span>
                  </th>
                  <th className="py-2.5 pr-3">
                    <span className="inline-flex items-center gap-1">
                      Civ
                      <StatHelp
                        text={STAT_HELP.thCiv}
                        ariaLabel={helpAria("Civ")}
                      />
                    </span>
                  </th>
                  <th className="py-2.5 pr-3">
                    <span className="inline-flex items-center gap-1">
                      vs Civ
                      <StatHelp
                        text={STAT_HELP.thVsCiv}
                        ariaLabel={helpAria("vs Civ")}
                      />
                    </span>
                  </th>
                  <th className="py-2.5 pr-3">
                    <span className="inline-flex items-center gap-1">
                      Map
                      <StatHelp
                        text={STAT_HELP.thMap}
                        ariaLabel={helpAria("Map")}
                      />
                    </span>
                  </th>
                  <th className="py-2.5 text-right">
                    <span className="inline-flex items-center justify-end gap-1 w-full">
                      Duration
                      <StatHelp
                        text={STAT_HELP.thDuration}
                        ariaLabel={helpAria("Duration")}
                        align="end"
                      />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {profile.match_history.slice(0, 20).map((m) => (
                  <tr
                    key={`${m.match_id}-${m.game_number}`}
                    className="border-b border-ttl-border-subtle/60 hover:bg-ttl-slate/40 transition-colors"
                  >
                    <td className="py-2.5 pr-3 text-muted tabular-nums">
                      #{m.match_id}
                    </td>
                    <td className="py-2.5 pr-3">
                      <span
                        className={`font-bold ${
                          m.result === "win" ? "text-ttl-win" : "text-ttl-loss"
                        }`}
                      >
                        {m.result === "win" ? "W" : "L"}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-primary">{m.opponent}</td>
                    <td className="py-2.5 pr-3 text-ttl-gold-light">
                      {m.player_civ}
                    </td>
                    <td className="py-2.5 pr-3 text-secondary">
                      {m.opponent_civ}
                    </td>
                    <td className="py-2.5 pr-3 text-secondary">{m.map}</td>
                    <td className="py-2.5 text-right text-muted">
                      {m.duration_minutes.toFixed(0)}m
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-fluid-xs text-muted mt-2">
            Rows with the same series id are games from the same series.
          </p>
        </section>
      </div>
    </main>
  );
}
