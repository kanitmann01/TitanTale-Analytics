"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PlayerStats } from "@/lib/types";
import type { Player } from "@/lib/types";
import MiniBar from "@/components/charts/MiniBar";
import StatHelp from "@/components/StatHelp";
import { STAT_HELP, helpAria } from "@/lib/stat-tooltips";

type SortKey = "wr" | "games" | "elo" | "civs";

export default function PlayersRankingsTable({
  players,
  roster,
}: {
  players: PlayerStats[];
  roster: Player[];
}) {
  const [sort, setSort] = useState<SortKey>("wr");
  const [dir, setDir] = useState<"desc" | "asc">("desc");

  const sorted = useMemo(() => {
    const mult = dir === "desc" ? -1 : 1;
    const list = [...players];
    list.sort((a, b) => {
      let cmp = 0;
      if (sort === "wr") {
        cmp = a.win_rate - b.win_rate;
      } else if (sort === "games") {
        cmp = a.total_games - b.total_games;
      } else if (sort === "elo") {
        const ae = a.elo ?? -1;
        const be = b.elo ?? -1;
        cmp = ae - be;
      } else {
        cmp = a.unique_civs - b.unique_civs;
      }
      return mult * cmp;
    });
    return list;
  }, [players, sort, dir]);

  function toggle(next: SortKey) {
    if (sort === next) {
      setDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSort(next);
      setDir("desc");
    }
  }

  const thBtn = (key: SortKey, label: string) => (
    <button
      type="button"
      onClick={() => toggle(key)}
      className="btn-press min-h-11 sm:min-h-0 inline-flex items-center text-left uppercase tracking-wider text-muted hover:text-ttl-gold rounded px-2 -mx-2 sm:px-1 sm:-mx-1 transition-[color] duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ttl-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-ttl-raised"
    >
      {label}
      {sort === key ? (dir === "desc" ? " v" : " ^") : ""}
    </button>
  );

  return (
    <div className="panel p-0 overflow-hidden transition-[border-color,box-shadow] duration-200 ease-out hover:border-ttl-gold/15">
      <div className="overflow-x-auto min-w-0 scroll-pl-4 overscroll-x-contain touch-pan-x">
      <table className="w-full text-fluid-sm min-w-[640px]">
        <thead>
          <tr className="border-b border-ttl-border text-left text-muted text-fluid-xs">
            <th className="py-3 pr-3 w-12 max-lg:sticky max-lg:left-0 max-lg:z-20 max-lg:bg-ttl-raised max-lg:shadow-[2px_0_10px_-4px_rgba(0,0,0,0.45)]">
              <span className="inline-flex items-center gap-1">
                #
                <StatHelp
                  text={STAT_HELP.rankColumn}
                  ariaLabel={helpAria("Rank")}
                />
              </span>
            </th>
            <th className="py-3 pr-4 max-lg:sticky max-lg:left-12 max-lg:z-20 max-lg:bg-ttl-raised max-lg:shadow-[4px_0_14px_-6px_rgba(0,0,0,0.55)]">
              Player
            </th>
            <th className="py-3 pr-4 hidden xl:table-cell">
              <span className="inline-flex items-center gap-1">
                Team
                <StatHelp
                  text={STAT_HELP.teamColumn}
                  ariaLabel={helpAria("Team")}
                />
              </span>
            </th>
            <th className="py-3 pr-4 w-44 hidden md:table-cell">
              <div className="inline-flex items-center gap-1">
                {thBtn("wr", "Win rate")}
                <StatHelp
                  text={STAT_HELP.winRate}
                  ariaLabel={helpAria("Win rate")}
                />
              </div>
            </th>
            <th className="py-3 pr-4 text-right max-lg:whitespace-nowrap">
              <span className="inline-flex items-center justify-end gap-1 w-full">
                W-L
                <StatHelp
                  text={STAT_HELP.wlColumn}
                  ariaLabel={helpAria("W-L")}
                  align="end"
                />
              </span>
            </th>
            <th className="py-3 pr-4 text-right hidden sm:table-cell">
              <div className="inline-flex items-center justify-end gap-1 w-full">
                {thBtn("games", "Games")}
                <StatHelp
                  text={STAT_HELP.gamesColumn}
                  ariaLabel={helpAria("Games")}
                  align="end"
                />
              </div>
            </th>
            <th className="py-3 pr-4 text-right hidden lg:table-cell">
              <div className="inline-flex items-center justify-end gap-1 w-full">
                {thBtn("elo", "ELO")}
                <StatHelp
                  text={STAT_HELP.eloColumn}
                  ariaLabel={helpAria("ELO")}
                  align="end"
                />
              </div>
            </th>
            <th className="py-3 pr-4 text-right hidden lg:table-cell">
              <div className="inline-flex items-center justify-end gap-1 w-full">
                {thBtn("civs", "Civs")}
                <StatHelp
                  text={STAT_HELP.civsColumn}
                  ariaLabel={helpAria("Civs")}
                  align="end"
                />
              </div>
            </th>
            <th className="py-3 text-right hidden xl:table-cell">
              <span className="inline-flex items-center justify-end gap-1 w-full">
                Avg Dur.
                <StatHelp
                  text={STAT_HELP.avgDurColumn}
                  ariaLabel={helpAria("Avg Dur.")}
                  align="end"
                />
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p, i) => {
            const rankClass =
              i === 0
                ? "rank-1"
                : i === 1
                  ? "rank-2"
                  : i === 2
                    ? "rank-3"
                    : "rank-n";
            const stickyBg =
              i < 3
                ? "max-lg:bg-ttl-raised/30 max-lg:group-hover:bg-ttl-slate/40"
                : "max-lg:bg-ttl-raised max-lg:group-hover:bg-ttl-slate/40";
            return (
              <tr
                key={p.player}
                className={`group table-row-interactive border-b border-ttl-border-subtle/60 hover:bg-ttl-slate/40 ${
                  i < 3 ? "bg-ttl-raised/30" : ""
                }`}
              >
                <td
                  className={`py-3 pr-3 w-12 max-lg:sticky max-lg:left-0 max-lg:z-10 max-lg:shadow-[3px_0_12px_-5px_rgba(0,0,0,0.5)] ${stickyBg}`}
                >
                  <span className={`rank-badge ${rankClass}`}>{i + 1}</span>
                </td>
                <td
                  className={`py-3 pr-4 font-medium max-lg:sticky max-lg:left-12 max-lg:z-10 max-lg:shadow-[4px_0_14px_-6px_rgba(0,0,0,0.55)] ${stickyBg}`}
                >
                  <Link
                    href={`/players/${encodeURIComponent(p.player)}`}
                    className="link-profile text-ttl-accent hover:text-ttl-gold inline-flex min-h-11 sm:min-h-0 items-center py-0.5"
                  >
                    {p.player}
                  </Link>
                </td>
                <td className="py-3 pr-4 text-secondary text-fluid-xs hidden xl:table-cell">
                  {roster.find((r) => r.player_name === p.player)?.team ??
                    "-"}
                </td>
                <td className="py-3 pr-4 hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <MiniBar
                      value={p.win_rate}
                      color={
                        p.win_rate >= 0.6
                          ? "var(--color-chart-1)"
                          : p.win_rate >= 0.5
                            ? "var(--color-chart-2)"
                            : "var(--color-text-muted)"
                      }
                      className="flex-1 min-w-[72px]"
                    />
                    <span
                      className={
                        p.win_rate >= 0.6
                          ? "text-ttl-gold font-bold shrink-0 tabular-nums"
                          : p.win_rate >= 0.5
                            ? "text-primary shrink-0 tabular-nums"
                            : "text-muted shrink-0 tabular-nums"
                      }
                    >
                      {(p.win_rate * 100).toFixed(1)}%
                    </span>
                  </div>
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
                  {p.elo ? Math.round(p.elo) : "-"}
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
      <p className="md:hidden text-fluid-xs text-muted text-center px-3 py-2.5 border-t border-ttl-border-subtle/60 bg-ttl-navy/20">
        Swipe sideways to see win rate, games, and ELO.
      </p>
    </div>
  );
}
