import type { Metadata } from "next";
import { getMapStats, getMapOutcomes, getMatches } from "@/lib/data";
import RankedHBarChart from "@/components/charts/RankedHBarChart";
import DonutChart from "@/components/charts/DonutChart";
import { getSeasonId } from "@/lib/season-server";
import { pageTitle } from "@/lib/site-metadata";
import type { MapStats } from "@/lib/types";
import StatHelp from "@/components/StatHelp";
import { STAT_HELP, helpAria } from "@/lib/stat-tooltips";

function leagueColor(league: string): string {
  const L: Record<string, string> = {
    Bronze: "#a0522d",
    Silver: "#94a3b8",
    Gold: "#d4af37",
    Platinum: "#5eead4",
  };
  return L[league] ?? "#6b7f94";
}

function balanceTone(std: number): { tag: string; cls: string } {
  if (std < 1) {
    return { tag: "Balanced", cls: "text-ttl-win" };
  }
  if (std < 1.4) {
    return { tag: "Moderate", cls: "text-ttl-gold" };
  }
  return { tag: "Lopsided", cls: "text-ttl-loss" };
}

function MapStatCard({
  m,
  rank,
  featured,
}: {
  m: MapStats;
  rank: number;
  featured: boolean;
}) {
  const b = balanceTone(m.balance_std);
  const rankClass =
    rank === 1 ? "rank-1" : rank === 2 ? "rank-2" : rank === 3 ? "rank-3" : "rank-n";
  return (
    <div
      className={
        featured
          ? "lift panel-accent mb-6 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6 items-center transition-[border-color,box-shadow] duration-200 ease-out hover:border-ttl-gold/35"
          : "lift panel rounded-lg border border-ttl-border-subtle/60 transition-[border-color,box-shadow] duration-200 ease-out hover:border-ttl-gold/25 hover:shadow-[0_0_0_1px_rgba(212,175,55,0.08)]"
      }
    >
      <div className={featured ? "" : "p-4"}>
        <div className={`flex items-center gap-3 ${featured ? "mb-3" : "mb-3"}`}>
          <span className={`rank-badge ${rankClass}`}>{rank}</span>
          <h3
            className={`font-display font-bold text-ttl-gold-light ${
              featured ? "text-fluid-lg" : "text-fluid-sm"
            }`}
          >
            {m.map}
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-4 text-fluid-xs">
          <div>
            <span className="text-muted flex items-center gap-1 uppercase tracking-wider mb-0.5">
              Games
              <StatHelp
                text={STAT_HELP.mapGames}
                ariaLabel={helpAria("Games")}
              />
            </span>
            <span className="text-primary font-medium">{m.total_games}</span>
          </div>
          <div>
            <span className="text-muted flex items-center gap-1 uppercase tracking-wider mb-0.5">
              Avg dur.
              <StatHelp
                text={STAT_HELP.mapAvgDur}
                ariaLabel={helpAria("Avg dur.")}
              />
            </span>
            <span className="text-secondary font-medium">
              {m.avg_duration.toFixed(1)}m
            </span>
          </div>
          <div>
            <span className="text-muted block uppercase tracking-wider mb-0.5 inline-flex items-center gap-1">
              Top civ
              <StatHelp
                text={STAT_HELP.mapTopCiv}
                ariaLabel={helpAria("Top civ")}
              />
            </span>
            <span className="text-secondary font-medium truncate block">
              {m.most_common_civ}
            </span>
          </div>
          <div className="col-span-3 sm:col-span-1">
            <span className="text-muted flex items-center gap-1 uppercase tracking-wider mb-0.5">
              Balance
              <StatHelp
                text={STAT_HELP.mapBalanceStd}
                ariaLabel={helpAria("Balance")}
              />
            </span>
            <span className={`font-medium ${b.cls}`}>
              {m.balance_std.toFixed(2)}
            </span>
            <span className="text-muted ml-2">({b.tag})</span>
          </div>
        </div>
      </div>
      {featured && (
        <div className="text-right sm:pr-4">
          <p className="text-fluid-2xl font-display font-bold text-primary leading-none">
            {m.total_games}
          </p>
          <p className="text-fluid-xs text-muted mt-1 inline-flex items-center justify-end gap-1">
            games
            <StatHelp
              text={STAT_HELP.mapGames}
              ariaLabel={helpAria("Games")}
              align="end"
            />
          </p>
        </div>
      )}
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const seasonId = await getSeasonId();
  return { title: pageTitle("Maps", seasonId) };
}

export default async function MapsPage() {
  const seasonId = await getSeasonId();
  const maps = getMapStats(seasonId).sort(
    (a, b) => b.total_games - a.total_games,
  );
  const outcomes = getMapOutcomes(seasonId);
  const matchRows = getMatches(seasonId);

  const gamesBars = maps.map((m) => ({
    label: m.map,
    value: m.total_games,
    color: "var(--color-chart-2)",
  }));

  const durationBars = [...maps]
    .sort((a, b) => b.avg_duration - a.avg_duration)
    .map((m) => ({
      label: m.map,
      value: m.avg_duration,
      color: "var(--color-chart-2)",
    }));

  const leagueTotals = outcomes.reduce<Record<string, number>>((acc, o) => {
    acc[o.league] = (acc[o.league] || 0) + o.num_games;
    return acc;
  }, {});
  const donutData = Object.entries(leagueTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([league, count]) => ({
      label: league,
      value: count,
      color: leagueColor(league),
    }));
  const totalLeagueGames = donutData.reduce((s, d) => s + d.value, 0);

  const topMap = maps[0];
  const longestAvg = [...maps].sort(
    (a, b) => b.avg_duration - a.avg_duration,
  )[0];
  const mostBalanced = [...maps].sort(
    (a, b) => a.balance_std - b.balance_std,
  )[0];
  const mostLopsided = [...maps].sort(
    (a, b) => b.balance_std - a.balance_std,
  )[0];

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-14">
        <header className="mb-10 anim-fade-up">
          <p className="section-label-gold mb-3">Map Pool</p>
          <h1 className="font-display text-fluid-2xl font-bold text-primary">
            {maps.length} Maps
          </h1>
          <p className="text-fluid-base text-secondary mt-2 max-w-lg leading-relaxed">
            Map pool ranked by games in the match log, with duration and balance
            metrics.
          </p>
          <p className="callout text-fluid-xs text-secondary mt-4 max-w-2xl">
            Homepage &quot;games in match log&quot; ({matchRows.length}) counts
            rows in the per-game results file. The league donut below sums
            appearance-weighted counts from map outcomes ({totalLeagueGames}{" "}
            total); the two views measure different scopes.
          </p>
        </header>

        <div className="flex flex-wrap gap-x-10 gap-y-4 mb-14 anim-slide-in d1">
          <div>
            <p className="text-fluid-xl font-display font-bold text-ttl-gold leading-none">
              {topMap.map}
            </p>
            <p className="text-fluid-xs text-muted mt-1">
              most played ({topMap.total_games} games)
            </p>
          </div>
          <div>
            <p className="text-fluid-xl font-display font-bold text-primary leading-none">
              {mostLopsided.map}
            </p>
            <p className="text-fluid-xs text-muted mt-1 inline-flex items-center gap-1 flex-wrap">
              most lopsided (balance {mostLopsided.balance_std.toFixed(2)})
              <StatHelp
                text={STAT_HELP.mapsKpiLopsided}
                ariaLabel={helpAria("Most lopsided map")}
              />
            </p>
          </div>
          <div>
            <p className="text-fluid-xl font-display font-bold text-ttl-gold-light leading-none">
              {mostBalanced.map}
            </p>
            <p className="text-fluid-xs text-muted mt-1 inline-flex items-center gap-1 flex-wrap">
              most balanced ({mostBalanced.balance_std.toFixed(2)} std)
              <StatHelp
                text={STAT_HELP.mapsKpiBalanced}
                ariaLabel={helpAria("Most balanced map")}
              />
            </p>
          </div>
          <div>
            <p className="text-fluid-xl font-display font-bold text-primary leading-none">
              {longestAvg.avg_duration.toFixed(0)}m
            </p>
            <p className="text-fluid-xs text-muted mt-1 inline-flex items-center gap-1 flex-wrap">
              longest avg ({longestAvg.map})
              <StatHelp
                text={STAT_HELP.mapsKpiLongestAvg}
                ariaLabel={helpAria("Longest average duration")}
              />
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-14">
          <section className="lg:col-span-2 anim-scale-in d2">
            <h2 className="section-label mb-4">Games per Map</h2>
            <div className="panel-flush p-5 overflow-x-auto min-w-0">
              <RankedHBarChart
                data={gamesBars}
                valueFormat="integer"
                accentColor="var(--color-chart-2)"
                caption="Teal bars match Analysis-style volume encoding (games in match log)."
              />
            </div>
          </section>

          <section className="anim-fade-up d3">
            <h2 className="section-label mb-4 flex flex-wrap items-center gap-1">
              Games by League
              <StatHelp
                text={STAT_HELP.mapsGamesByLeague}
                ariaLabel={helpAria("Games by League")}
              />
            </h2>
            <div className="panel flex flex-col items-center py-6">
              <DonutChart
                data={donutData}
                centerValue={String(totalLeagueGames)}
                centerLabel="total games"
              />
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 justify-center">
                {donutData.map((d) => (
                  <div
                    key={d.label}
                    className="flex items-center gap-1.5 text-fluid-xs"
                  >
                    <span
                      className="w-2 h-2 rounded-sm shrink-0"
                      style={{ background: d.color }}
                    />
                    <span className="text-secondary">{d.label}</span>
                    <span className="text-muted">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <section className="mb-14 anim-slide-in d4">
          <h2 className="section-label mb-4">Average Duration by Map</h2>
          <div className="panel overflow-x-auto min-w-0">
            <RankedHBarChart
              data={durationBars}
              valueFormat="minutes1"
              accentColor="var(--color-chart-2)"
              caption="Same horizontal Recharts layout as the Analysis duration distribution."
            />
          </div>
        </section>

        <div className="divider my-10" />

        <section className="anim-fade-up d5">
          <h2 className="h2-section font-display text-fluid-lg font-bold text-primary mb-6 flex flex-wrap items-center gap-1">
            Map Details
            <StatHelp
              text={STAT_HELP.mapsMapDetails}
              ariaLabel={helpAria("Map Details")}
            />
          </h2>
          {maps.length > 0 && (
            <MapStatCard m={maps[0]} rank={1} featured />
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {maps.slice(1).map((m, i) => (
              <MapStatCard key={m.map} m={m} rank={i + 2} featured={false} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
