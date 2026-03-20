"use client";

import { useMemo, useState } from "react";
import type { UpsetProbability } from "@/lib/types";
import StatHelp from "@/components/StatHelp";
import { STAT_HELP, helpAria } from "@/lib/stat-tooltips";

export default function UpsetBinExplorer({ bins }: { bins: UpsetProbability[] }) {
  const [index, setIndex] = useState(0);

  const ordered = useMemo(() => {
    function binStart(label: string): number {
      const m = label.match(/^(\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    }
    return [...bins].sort((a, b) => binStart(a.elo_bin) - binStart(b.elo_bin));
  }, [bins]);

  if (ordered.length === 0) return null;

  const i = Math.min(Math.max(0, index), ordered.length - 1);
  const row = ordered[i];
  const actualPct = row.actual_upset_rate * 100;
  const expectedPct = row.expected_upset_rate * 100;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="section-label mb-0">ELO-gap explorer</h3>
        <StatHelp
          text={STAT_HELP.upsetBinExplorer}
          ariaLabel={helpAria("ELO-gap explorer")}
        />
      </div>
      <p className="text-fluid-xs text-muted leading-relaxed max-w-prose">
        Descriptive rates for this season&apos;s rating-gap buckets only. Not a
        forecast of future matches.
      </p>

      <div>
        <label
          htmlFor="upset-bin-slider"
          className="text-fluid-xs text-secondary block mb-2"
        >
          Favorite rating gap:{" "}
          <span className="text-primary font-medium tabular-nums">
            {row.elo_bin} pts
          </span>
        </label>
        <input
          id="upset-bin-slider"
          type="range"
          min={0}
          max={ordered.length - 1}
          value={i}
          onChange={(e) => setIndex(Number(e.target.value))}
          className="w-full accent-ttl-gold h-2 rounded-full bg-ttl-surface/80"
          aria-valuetext={`${row.elo_bin} ELO bin, ${row.n} games`}
        />
        <div className="flex flex-wrap justify-between gap-x-1 gap-y-1 text-fluid-[10px] text-muted mt-2 font-mono leading-tight">
          {ordered.map((b, idx) => (
            <span
              key={b.elo_bin}
              className={
                idx === i
                  ? "text-ttl-gold font-medium"
                  : "opacity-80"
              }
            >
              {b.elo_bin}
            </span>
          ))}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-2.5 sm:gap-3 text-fluid-sm">
        <div className="rounded-md border border-ttl-border-subtle/60 bg-ttl-surface/20 px-3 py-2.5">
          <dt className="text-fluid-xs text-muted uppercase tracking-wider mb-1">
            Actual upset %
          </dt>
          <dd className="text-primary font-display font-bold text-fluid-lg tabular-nums">
            {actualPct.toFixed(1)}%
          </dd>
        </div>
        <div className="rounded-md border border-ttl-border-subtle/60 bg-ttl-surface/20 px-3 py-2.5">
          <dt className="text-fluid-xs text-muted uppercase tracking-wider mb-1">
            ELO model %
          </dt>
          <dd className="text-primary font-display font-bold text-fluid-lg tabular-nums">
            {expectedPct.toFixed(1)}%
          </dd>
        </div>
        <div className="rounded-md border border-ttl-border-subtle/60 bg-ttl-surface/20 px-3 py-2.5 col-span-2">
          <dt className="text-fluid-xs text-muted uppercase tracking-wider mb-1">
            Volatility factor (actual / expected upset rate)
          </dt>
          <dd className="text-ttl-accent font-display font-bold text-fluid-lg tabular-nums">
            {row.volatility_factor.toFixed(2)}x
          </dd>
          <dd className="text-fluid-xs text-muted mt-1.5">
            Games in this bucket: {row.n}
          </dd>
        </div>
      </dl>
    </div>
  );
}
