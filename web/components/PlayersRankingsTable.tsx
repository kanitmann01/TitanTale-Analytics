"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PlayerStats } from "@/lib/types";
import type { Player } from "@/lib/types";
import MiniBar from "@/components/charts/MiniBar";

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
      className="text-left uppercase tracking-wider hover:text-primary transition-colors"
    >
      {label}
      {sort === key ? (dir === "desc" ? " v" : " ^") : ""}
    </button>
  );

  return (
    <div className="overflow-x-auto min-w-0">
      <table className="w-full text-fluid-sm min-w-[640px]">
        <thead>
          <tr className="border-b border-ttl-border text-left text-muted text-fluid-xs">
            <th className="py-3 pr-3 w-8">#</th>
            <th className="py-3 pr-4">Player</th>
            <th className="py-3 pr-4 hidden xl:table-cell">Team</th>
            <th className="py-3 pr-4 w-44 hidden md:table-cell">
              {thBtn("wr", "Win rate")}
            </th>
            <th className="py-3 pr-4 text-right">W-L</th>
            <th className="py-3 pr-4 text-right hidden sm:table-cell">
              {thBtn("games", "Games")}
            </th>
            <th className="py-3 pr-4 text-right hidden lg:table-cell">
              {thBtn("elo", "ELO")}
            </th>
            <th className="py-3 pr-4 text-right hidden lg:table-cell">
              {thBtn("civs", "Civs")}
            </th>
            <th className="py-3 text-right hidden xl:table-cell">Avg Dur.</th>
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
                <td className="py-3 pr-4 font-medium">
                  <Link
                    href={`/players/${encodeURIComponent(p.player)}`}
                    className="text-ttl-accent hover:text-ttl-gold underline-offset-2 hover:underline"
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
  );
}
