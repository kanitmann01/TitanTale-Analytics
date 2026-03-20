import type { Metadata } from "next";
import Link from "next/link";
import {
  getTournamentInfo,
  getPlayerStats,
  getCivStats,
  getMapStats,
  getMatches,
  getUpsetProbabilities,
} from "@/lib/data";
import MiniBar from "@/components/charts/MiniBar";
import StatHelp from "@/components/StatHelp";
import { STAT_HELP, helpAria } from "@/lib/stat-tooltips";
import { getSeasonId } from "@/lib/season-server";
import { pageTitle } from "@/lib/site-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const seasonId = await getSeasonId();
  return {
    title: pageTitle("Overview", seasonId),
  };
}

export default async function Home() {
  const seasonId = await getSeasonId();
  const tournament = getTournamentInfo(seasonId);
  const playerStats = getPlayerStats(seasonId).sort(
    (a, b) => b.win_rate - a.win_rate,
  );
  const civStats = getCivStats(seasonId).sort(
    (a, b) => b.pick_rate - a.pick_rate,
  );
  const mapStats = getMapStats(seasonId).sort(
    (a, b) => b.total_games - a.total_games,
  );
  const matches = getMatches(seasonId);

  const totalGames = matches.length;
  const top5Players = playerStats.slice(0, 5);
  const top6Civs = civStats.slice(0, 6);
  const top4Maps = mapStats.slice(0, 4);

  const avgDuration =
    matches.reduce((s, m) => s + m.duration_minutes, 0) / matches.length;
  const topWr = playerStats[0];
  const latest = matches.length > 0 ? matches[matches.length - 1] : null;

  const seasonTagline = tournament.tournamentName.replace(
    /^T90 Titans League\s+/i,
    "",
  );

  const upsetBins = getUpsetProbabilities(seasonId);
  const upsetWeightN = upsetBins.reduce((s, b) => s + b.n, 0);
  const weightedUpsetVol =
    upsetWeightN > 0
      ? upsetBins.reduce((s, b) => s + b.volatility_factor * b.n, 0) /
        upsetWeightN
      : null;

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-ttl-gold-dim/10 via-transparent to-ttl-accent-dim/5 hero-ambient" />
        <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-ttl-gold-dim/[0.04] to-transparent" />
        <div className="max-w-6xl mx-auto px-4 md:px-6 pt-16 md:pt-20 pb-12 md:pb-16 relative">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-10 lg:gap-12 items-center">
            <div>
              <p className="section-label-gold mb-4 anim-fade-up">
                {seasonTagline} - Age of Empires II: Definitive Edition
              </p>
              <h1 className="font-display text-fluid-3xl font-bold text-primary leading-[1.05] anim-fade-up d1 max-w-2xl">
                T90 Titans League
              </h1>
              <p className="text-fluid-base text-secondary mt-5 max-w-lg leading-relaxed anim-fade-up d2">
                {tournament.format}. {tournament.totalPlayers} players competing
                for a ${tournament.prizePool.toLocaleString()} prize pool across{" "}
                {mapStats.length} maps and {civStats.length} civilizations.
              </p>

              <div className="flex flex-wrap gap-x-8 gap-y-4 mt-8 anim-fade-up d3">
                <div>
                  <p className="text-fluid-2xl font-display font-bold text-ttl-gold leading-none">
                    {totalGames}
                  </p>
                  <p className="text-fluid-xs text-muted mt-1.5 inline-flex items-center gap-1">
                    games in match log
                    <StatHelp
                      text={STAT_HELP.gamesInMatchLog}
                      ariaLabel={helpAria("Games in match log")}
                    />
                  </p>
                </div>
                <div>
                  <p className="text-fluid-2xl font-display font-bold text-primary leading-none">
                    {avgDuration.toFixed(0)}
                    <span className="text-fluid-lg text-muted ml-0.5">min</span>
                  </p>
                  <p className="text-fluid-xs text-muted mt-1.5 inline-flex items-center gap-1">
                    avg duration
                    <StatHelp
                      text={STAT_HELP.avgDuration}
                      ariaLabel={helpAria("Average duration")}
                    />
                  </p>
                </div>
                <div>
                  <p className="text-fluid-2xl font-display font-bold text-ttl-gold-light leading-none">
                    {(topWr.win_rate * 100).toFixed(0)}%
                  </p>
                  <p className="text-fluid-xs text-muted mt-1.5 inline-flex items-center gap-1 flex-wrap">
                    top win rate ({topWr.player})
                    <StatHelp
                      text={STAT_HELP.topWinRate}
                      ariaLabel={helpAria("Top win rate")}
                    />
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-8 anim-fade-up d4">
                {tournament.links.youtube && (
                  <a
                    href={tournament.links.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta-shimmer btn-press inline-flex items-center justify-center min-h-11 sm:min-h-0 rounded border border-ttl-gold/40 bg-ttl-gold/10 px-5 sm:px-4 py-2.5 sm:py-2 text-fluid-sm text-ttl-gold hover:bg-ttl-gold/20 hover:border-ttl-gold/55 hover:shadow-[0_0_24px_-6px_rgba(212,175,55,0.22)]"
                  >
                    Watch on YouTube
                  </a>
                )}
                {tournament.links.liquipedia && (
                  <a
                    href={tournament.links.liquipedia}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-press inline-flex items-center justify-center min-h-11 sm:min-h-0 rounded border border-ttl-border-subtle px-5 sm:px-4 py-2.5 sm:py-2 text-fluid-sm text-secondary hover:text-primary hover:border-ttl-accent/35 hover:bg-ttl-surface/30"
                  >
                    Full bracket on Liquipedia
                  </a>
                )}
              </div>
            </div>

            {latest && (
              <div className="panel border-ttl-border-subtle anim-fade-up d3 lg:justify-self-end w-full max-w-md">
                <p className="section-label mb-3 flex flex-wrap items-center gap-1">
                  Latest match (log)
                  <StatHelp
                    text={STAT_HELP.latestMatchLog}
                    ariaLabel={helpAria("Latest match")}
                  />
                </p>
                <p className="font-display text-fluid-base font-bold text-primary">
                  {latest.player1}{" "}
                  <span className="text-muted font-body font-normal text-fluid-sm">
                    vs
                  </span>{" "}
                  {latest.player2}
                </p>
                <p className="text-fluid-xs text-secondary mt-2">
                  {latest.map} - {latest.duration_minutes}m - Winner:{" "}
                  <span className="text-ttl-gold">{latest.winner}</span>
                </p>
                <p className="text-fluid-xs text-muted mt-1">{latest.stage}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="divider" />

      <section className="max-w-6xl mx-auto px-4 md:px-6 py-10">
        <div className="panel border-ttl-gold/20 anim-fade-up flex flex-col lg:flex-row lg:items-stretch gap-8 lg:gap-10">
          <div className="flex-1 min-w-0">
            <p className="section-label-gold mb-2 flex flex-wrap items-center gap-1">
              Tournament ledger
              <StatHelp
                text={STAT_HELP.researchLedgerTeaser}
                ariaLabel={helpAria("Tournament ledger")}
              />
            </p>
            <p className="text-fluid-sm text-secondary leading-relaxed max-w-xl">
              Myths checked against the data, upset rates by rating gap, and ten
              formal hypothesis verdicts with caveats.
            </p>
            <Link
              href="/research"
              className="btn-press inline-flex mt-5 min-h-11 items-center rounded border border-ttl-gold/35 bg-ttl-gold/10 px-4 py-2 text-fluid-sm text-ttl-gold hover:bg-ttl-gold/18 hover:border-ttl-gold/50"
            >
              Open investigations &rarr;
            </Link>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-6 lg:border-l lg:border-ttl-border-subtle lg:pl-10">
            {weightedUpsetVol != null && (
              <div>
                <p className="text-fluid-2xl font-display font-bold text-ttl-accent leading-none">
                  {weightedUpsetVol.toFixed(2)}x
                </p>
                <p className="text-fluid-xs text-muted mt-2 max-w-[11rem] leading-relaxed">
                  Weighted upset volatility vs a simple ELO curve (this season)
                </p>
              </div>
            )}
            <div>
              <p className="text-fluid-2xl font-display font-bold text-ttl-gold leading-none">
                89%
              </p>
              <p className="text-fluid-xs text-muted mt-2 max-w-[11rem] leading-relaxed">
                Series taken by the game-1 winner (research run that produced
                the written findings)
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 md:px-6 pt-12 pb-12">
        <div className="flex items-baseline justify-between mb-8 anim-slide-in">
          <h2 className="h2-section font-display text-fluid-lg font-bold text-primary flex flex-wrap items-center gap-1">
            Top Players
            <StatHelp
              text={STAT_HELP.topPlayersHome}
              ariaLabel={helpAria("Top Players")}
            />
          </h2>
          <Link
            href="/players"
            className="btn-press text-fluid-xs text-ttl-accent hover:text-ttl-gold"
          >
            All players &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 anim-fade-up d2">
          {top5Players.map((p, i) => (
            <div
              key={p.player}
              className={
                i === 0
                  ? "panel-accent sm:col-span-2 lg:col-span-1 lg:row-span-1 flex flex-col justify-center"
                  : "panel-inset flex flex-col justify-center"
              }
            >
              <div className="flex items-center gap-2 mb-3">
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
                <span className="font-display text-fluid-sm font-bold text-ttl-gold truncate">
                  {p.player}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-fluid-xs mb-2">
                <div>
                  <span className="text-muted block">Win rate</span>
                  <span className="text-primary font-bold">
                    {(p.win_rate * 100).toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-muted block">Record</span>
                  <span className="text-ttl-win">{p.wins}</span>
                  <span className="text-muted">-</span>
                  <span className="text-ttl-loss">{p.losses}</span>
                </div>
                <div>
                  <span className="text-muted block">Games</span>
                  <span className="text-secondary">{p.total_games}</span>
                </div>
              </div>
              <MiniBar value={p.win_rate} />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-b from-transparent via-ttl-raised/40 to-transparent">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
          <div className="flex items-baseline justify-between mb-8 anim-slide-in d3">
            <h2 className="h2-section font-display text-fluid-lg font-bold text-primary flex flex-wrap items-center gap-1">
              Civilization Meta
              <StatHelp
                text={STAT_HELP.civilizationMetaHome}
                ariaLabel={helpAria("Civilization Meta")}
              />
            </h2>
            <Link
              href="/civilizations"
              className="btn-press text-fluid-xs text-ttl-accent hover:text-ttl-gold"
            >
              All civilizations &rarr;
            </Link>
          </div>

          <div className="flex flex-wrap gap-3 anim-fade-up d4">
            {top6Civs.map((c, i) => {
              const pct = (c.pick_rate * 100).toFixed(1);
              const wr = (c.win_rate * 100).toFixed(0);
              const isTop = i < 2;
              return (
                <div
                  key={c.civilization}
                  className={`lift rounded-lg border px-5 py-4 ${
                    isTop
                      ? "panel-accent"
                      : "border-ttl-border-subtle bg-ttl-raised hover:border-ttl-accent/30"
                  }`}
                >
                  <p className="font-display text-fluid-sm font-bold text-ttl-gold mb-1">
                    {c.civilization}
                  </p>
                  <div className="flex gap-4 text-fluid-xs">
                    <span className="text-ttl-accent">{pct}% pick</span>
                    <span
                      className={
                        Number(wr) >= 55 ? "text-ttl-gold" : "text-secondary"
                      }
                    >
                      {wr}% win
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 md:px-6 pt-12 pb-16">
        <div className="flex items-baseline justify-between mb-8 anim-slide-in d5">
          <h2 className="h2-section font-display text-fluid-lg font-bold text-primary flex flex-wrap items-center gap-1">
            Map Pool
            <StatHelp
              text={STAT_HELP.mapPoolHome}
              ariaLabel={helpAria("Map Pool")}
            />
          </h2>
          <Link
            href="/maps"
            className="btn-press text-fluid-xs text-ttl-accent hover:text-ttl-gold"
          >
            All maps &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 anim-fade-up d6">
          {top4Maps.map((m) => (
            <div key={m.map} className="lift panel group">
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-display text-fluid-sm font-bold text-ttl-gold-light group-hover:text-ttl-gold transition-colors">
                  {m.map}
                </h3>
                <div className="text-right shrink-0">
                  <span className="text-fluid-xl font-display font-bold text-primary leading-none block">
                    {m.total_games}
                  </span>
                  <span className="text-fluid-xs text-muted">games</span>
                </div>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-2 text-fluid-xs text-muted">
                <span>{m.avg_duration.toFixed(0)}m avg</span>
                <span className="text-secondary truncate">{m.most_common_civ}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
