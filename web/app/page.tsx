import Link from "next/link";
import {
  getTournamentInfo,
  getPlayerStats,
  getCivStats,
  getMapStats,
  getMatches,
} from "@/lib/data";
import MiniBar from "@/components/charts/MiniBar";

export default function Home() {
  const tournament = getTournamentInfo();
  const playerStats = getPlayerStats().sort((a, b) => b.win_rate - a.win_rate);
  const civStats = getCivStats().sort((a, b) => b.pick_rate - a.pick_rate);
  const mapStats = getMapStats().sort((a, b) => b.total_games - a.total_games);
  const matches = getMatches();

  const totalGames = matches.length;
  const top5Players = playerStats.slice(0, 5);
  const top6Civs = civStats.slice(0, 6);
  const top4Maps = mapStats.slice(0, 4);

  const avgDuration =
    matches.reduce((s, m) => s + m.duration_minutes, 0) / matches.length;
  const topWr = playerStats[0];

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-ttl-gold-dim/10 via-transparent to-ttl-accent-dim/5" />
        <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-ttl-gold-dim/[0.04] to-transparent" />
        <div className="max-w-6xl mx-auto px-6 pt-24 pb-20 relative">
          <p className="section-label-gold mb-5 anim-fade-up">
            Season 5 -- Age of Empires II: Definitive Edition
          </p>
          <h1 className="font-display text-fluid-3xl font-bold text-primary leading-[1.05] anim-fade-up d1 max-w-2xl">
            T90 Titans League
          </h1>
          <p className="text-fluid-base text-secondary mt-6 max-w-lg leading-relaxed anim-fade-up d2">
            {tournament.format}. {tournament.totalPlayers} players competing for
            a ${tournament.prizePool.toLocaleString()} prize pool across{" "}
            {mapStats.length} maps and {civStats.length} civilizations.
          </p>

          {/* Inline stat strip -- asymmetric, not a uniform grid */}
          <div className="flex flex-wrap gap-x-10 gap-y-4 mt-10 anim-fade-up d3">
            <div>
              <p className="text-fluid-2xl font-display font-bold text-ttl-gold leading-none">
                {totalGames}
              </p>
              <p className="text-fluid-xs text-muted mt-1.5">games played</p>
            </div>
            <div>
              <p className="text-fluid-2xl font-display font-bold text-primary leading-none">
                {avgDuration.toFixed(0)}
                <span className="text-fluid-lg text-muted ml-0.5">min</span>
              </p>
              <p className="text-fluid-xs text-muted mt-1.5">avg duration</p>
            </div>
            <div>
              <p className="text-fluid-2xl font-display font-bold text-ttl-gold-light leading-none">
                {(topWr.win_rate * 100).toFixed(0)}%
              </p>
              <p className="text-fluid-xs text-muted mt-1.5">
                top win rate ({topWr.player})
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* Players -- featured #1 + compact list */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="flex items-baseline justify-between mb-8 anim-slide-in">
          <h2 className="font-display text-fluid-lg font-bold text-primary">
            Top Players
          </h2>
          <Link
            href="/players"
            className="text-fluid-xs text-ttl-accent hover:text-ttl-gold transition-colors"
          >
            All players &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-8 anim-fade-up d2">
          {/* Featured #1 */}
          <div className="panel-accent flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <span className="rank-badge rank-1">1</span>
              <span className="font-display text-fluid-lg font-bold text-ttl-gold">
                {top5Players[0].player}
              </span>
            </div>
            <div className="flex gap-6 text-fluid-sm mb-3">
              <div>
                <span className="text-muted text-fluid-xs block">Win Rate</span>
                <span className="text-primary font-bold">
                  {(top5Players[0].win_rate * 100).toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-muted text-fluid-xs block">Record</span>
                <span className="text-ttl-win">{top5Players[0].wins}</span>
                <span className="text-muted mx-0.5">-</span>
                <span className="text-ttl-loss">{top5Players[0].losses}</span>
              </div>
              <div>
                <span className="text-muted text-fluid-xs block">Games</span>
                <span className="text-secondary">{top5Players[0].total_games}</span>
              </div>
            </div>
            <MiniBar value={top5Players[0].win_rate} />
          </div>

          {/* Compact list #2-5 */}
          <div className="space-y-2">
            {top5Players.slice(1).map((p, i) => (
              <div
                key={p.player}
                className="flex items-center gap-3 panel-inset"
              >
                <span className={`rank-badge ${i === 0 ? "rank-2" : i === 1 ? "rank-3" : "rank-n"}`}>
                  {i + 2}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-fluid-sm text-primary font-medium truncate">
                      {p.player}
                    </span>
                    <span className="text-fluid-xs text-ttl-gold font-bold shrink-0 ml-2">
                      {(p.win_rate * 100).toFixed(0)}%
                    </span>
                  </div>
                  <MiniBar value={p.win_rate} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Civs -- tag-cloud style with pick-rate emphasis, not another list */}
      <section className="bg-gradient-to-b from-transparent via-ttl-raised/40 to-transparent">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="flex items-baseline justify-between mb-8 anim-slide-in d3">
            <h2 className="font-display text-fluid-lg font-bold text-primary">
              Civilization Meta
            </h2>
            <Link
              href="/civilizations"
              className="text-fluid-xs text-ttl-accent hover:text-ttl-gold transition-colors"
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
                      : "border-ttl-border-subtle bg-ttl-raised"
                  }`}
                >
                  <p className={`font-display font-bold mb-1 ${
                    isTop ? "text-fluid-lg text-ttl-gold" : "text-fluid-sm text-primary"
                  }`}>
                    {c.civilization}
                  </p>
                  <div className="flex gap-4 text-fluid-xs">
                    <span className="text-ttl-accent">{pct}% pick</span>
                    <span className={Number(wr) >= 55 ? "text-ttl-gold" : "text-secondary"}>
                      {wr}% win
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Maps -- horizontal scroll cards, different from both sections above */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20">
        <div className="flex items-baseline justify-between mb-8 anim-slide-in d5">
          <h2 className="font-display text-fluid-lg font-bold text-primary">
            Map Pool
          </h2>
          <Link
            href="/maps"
            className="text-fluid-xs text-ttl-accent hover:text-ttl-gold transition-colors"
          >
            All maps &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 anim-fade-up d6">
          {top4Maps.map((m, i) => (
            <div
              key={m.map}
              className="lift panel group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display text-fluid-sm font-bold text-ttl-gold-light group-hover:text-ttl-gold transition-colors">
                  {m.map}
                </h3>
                <span className="text-fluid-xl font-display font-bold text-primary leading-none">
                  {m.total_games}
                </span>
              </div>
              <div className="flex justify-between text-fluid-xs">
                <span className="text-muted">{m.avg_duration.toFixed(0)}m avg</span>
                <span className="text-secondary truncate ml-2">{m.most_common_civ}</span>
              </div>
              {i === 0 && (
                <div className="mt-2 pt-2 border-t border-ttl-border-subtle">
                  <MiniBar
                    value={1}
                    color="var(--color-chart-3)"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div className="divider" />
      <footer className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-fluid-xs text-muted">
        <p>Data sourced from Liquipedia and tournament records.</p>
        <div className="flex gap-4">
          {tournament.links.liquipedia && (
            <a
              href={tournament.links.liquipedia}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ttl-accent hover:text-ttl-gold transition-colors"
            >
              Liquipedia
            </a>
          )}
          {tournament.links.youtube && (
            <a
              href={tournament.links.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ttl-accent hover:text-ttl-gold transition-colors"
            >
              YouTube
            </a>
          )}
        </div>
      </footer>
    </main>
  );
}
