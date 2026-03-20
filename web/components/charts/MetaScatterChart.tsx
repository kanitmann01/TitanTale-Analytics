"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
  Cell,
} from "recharts";

export interface MetaScatterDatum {
  label: string;
  x: number;
  y: number;
  /** Bubble area scale (e.g. games played) */
  z?: number;
  fill?: string;
}

/**
 * Serializable formatting mode (Server Components cannot pass formatter functions).
 * - eloWinRate: x = ELO, y = win rate in 0..1
 * - pickWinRate100: x = pick rate already as 0..100, y = win rate 0..1
 */
export type MetaScatterMode = "eloWinRate" | "pickWinRate100";

interface MetaScatterChartProps {
  data: MetaScatterDatum[];
  xLabel: string;
  yLabel: string;
  chartTitle?: string;
  mode: MetaScatterMode;
}

function MetaScatterTooltip({
  active,
  payload,
  formatTooltipX,
  formatTooltipY,
}: {
  active?: boolean;
  payload?: Array<{ payload: MetaScatterDatum }>;
  formatTooltipX: (v: number) => string;
  formatTooltipY: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-md border border-ttl-border bg-ttl-surface px-3 py-2 text-fluid-xs shadow-lg">
      <p className="font-bold text-primary mb-1">{d.label}</p>
      <p className="text-secondary">{formatTooltipX(d.x)}</p>
      <p className="text-secondary">{formatTooltipY(d.y)}</p>
      {d.z !== undefined && d.z !== null && (
        <p className="text-muted mt-0.5">Games: {d.z}</p>
      )}
    </div>
  );
}

const defaultYPercent = (v: number) => `${(v * 100).toFixed(0)}%`;

function formattersForMode(mode: MetaScatterMode): {
  xTickFormatter: (v: number) => string;
  yTickFormatter: (v: number) => string;
  formatTooltipX: (v: number) => string;
  formatTooltipY: (v: number) => string;
} {
  if (mode === "pickWinRate100") {
    const xTick = (v: number) => `${v.toFixed(0)}%`;
    const yTick = (v: number) => `${(v * 100).toFixed(0)}%`;
    return {
      xTickFormatter: xTick,
      yTickFormatter: yTick,
      formatTooltipX: (v: number) => `Pick rate: ${v.toFixed(1)}%`,
      formatTooltipY: (v: number) => `Win rate: ${(v * 100).toFixed(1)}%`,
    };
  }
  const xTick = (v: number) => String(Math.round(v));
  return {
    xTickFormatter: xTick,
    yTickFormatter: defaultYPercent,
    formatTooltipX: (v: number) => `ELO: ${Math.round(v)}`,
    formatTooltipY: (v: number) => `Win rate: ${(v * 100).toFixed(1)}%`,
  };
}

export default function MetaScatterChart({
  data,
  xLabel,
  yLabel,
  chartTitle,
  mode,
}: MetaScatterChartProps) {
  const { xTickFormatter, yTickFormatter, formatTooltipX, formatTooltipY } =
    formattersForMode(mode);

  if (data.length === 0) {
    return (
      <p className="text-fluid-sm text-muted px-1 py-8 text-center">
        No data to plot.
      </p>
    );
  }

  const zVals = data.map((d) => d.z).filter((z): z is number => z != null && !Number.isNaN(z));
  const minZ = zVals.length ? Math.min(...zVals) : 1;
  const maxZ = zVals.length ? Math.max(...zVals) : 1;
  const zLo = minZ === maxZ ? Math.max(1, minZ - 1) : minZ;
  const zHi = minZ === maxZ ? maxZ + 1 : maxZ;

  return (
    <div className="w-full">
      {chartTitle && (
        <p className="text-fluid-sm font-bold text-primary mb-3 px-1">{chartTitle}</p>
      )}
      <ResponsiveContainer width="100%" height={340}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 40, left: 12 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border-subtle)"
          />
          <XAxis
            type="number"
            dataKey="x"
            domain={["auto", "auto"]}
            tickFormatter={xTickFormatter}
            stroke="var(--color-text-muted)"
            fontSize={11}
          >
            <Label
              value={xLabel}
              position="bottom"
              offset={20}
              style={{ fill: "var(--color-text-muted)", fontSize: 11 }}
            />
          </XAxis>
          <YAxis
            type="number"
            dataKey="y"
            domain={["auto", "auto"]}
            tickFormatter={yTickFormatter}
            stroke="var(--color-text-muted)"
            fontSize={11}
          >
            <Label
              value={yLabel}
              angle={-90}
              position="insideLeft"
              offset={-2}
              style={{ fill: "var(--color-text-muted)", fontSize: 11 }}
            />
          </YAxis>
          {zVals.length > 0 && (
            <ZAxis
              type="number"
              dataKey="z"
              domain={[zLo, zHi]}
              range={[48, 220]}
              name="Games"
            />
          )}
          <Tooltip
            content={(props: Record<string, unknown>) => (
              <MetaScatterTooltip
                active={props.active as boolean | undefined}
                payload={
                  props.payload as Array<{ payload: MetaScatterDatum }> | undefined
                }
                formatTooltipX={formatTooltipX}
                formatTooltipY={formatTooltipY}
              />
            )}
          />
          <Scatter data={data} fill="var(--color-chart-2)">
            {data.map((d, i) => (
              <Cell
                key={`${d.label}-${i}`}
                fill={d.fill ?? "var(--color-chart-2)"}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      {zVals.length > 0 && (
        <p className="text-fluid-xs text-muted mt-2 leading-relaxed px-1">
          Point size reflects games in view (about {minZ}
          {minZ !== maxZ ? ` to ${maxZ}` : ""}). Larger points mean more games.
        </p>
      )}
    </div>
  );
}
