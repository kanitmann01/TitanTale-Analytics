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
        <label className="flex items-center gap-2 text-fluid-xs text-muted cursor-pointer">
          <input
            type="checkbox"
            checked={min5}
            onChange={(e) => setMin5(e.target.checked)}
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
        title="Green = above-baseline WR. Red = below. Diagonal lines = low sample (under 5 games)."
      />
      <p className="text-fluid-xs text-muted mt-3">
        Minimum 3 games in source data; small samples stay noisy. Use the
        filter to hide very low-n cells.
      </p>
    </div>
  );
}
