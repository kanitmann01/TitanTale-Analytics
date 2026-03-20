"use client";

import { useState } from "react";
import HeatmapChart from "@/components/charts/HeatmapChart";

interface Cell {
  row: string;
  col: string;
  value: number;
  label?: string;
  count?: number;
}

export default function AffinityHeatmapSection({
  data,
  rows,
  cols,
}: {
  data: Cell[];
  rows: string[];
  cols: string[];
}) {
  const [min5, setMin5] = useState(false);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 mb-3">
        <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-transparent px-1 py-1 text-fluid-sm text-muted hover:border-ttl-border-subtle hover:bg-ttl-slate/20 md:min-h-0 md:gap-2 md:border-0 md:px-0 md:py-0 md:text-fluid-xs md:hover:bg-transparent">
          <input
            type="checkbox"
            checked={min5}
            onChange={(e) => setMin5(e.target.checked)}
            className="h-4 w-4 shrink-0 rounded border-ttl-border text-ttl-accent focus:ring-ttl-accent/40"
          />
          Hide cells with fewer than 5 games
        </label>
      </div>
      <HeatmapChart
        data={data}
        rows={rows}
        cols={cols}
        cellSize={32}
        minCount={min5 ? 5 : 0}
        showLegend
        valueFormat={(v) => {
          const pct = (v - 0.5) * 100;
          const sign = pct >= 0 ? "+" : "";
          return `${sign}${pct.toFixed(0)}%`;
        }}
      />
      <p className="text-fluid-xs text-muted mt-3">
        Minimum 3 games in source data; small samples stay noisy. Use the
        filter to hide very low-n cells.
      </p>
    </div>
  );
}
