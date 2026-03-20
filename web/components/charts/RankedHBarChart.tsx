"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export interface RankedBarDatum {
  label: string;
  value: number;
  color?: string;
}

/** Serializable axis/tooltip formatting (no functions from Server Components). */
export type RankedValueFormat = "integer" | "percent0" | "percent1" | "minutes1";

function formatByPreset(v: number, preset: RankedValueFormat): string {
  switch (preset) {
    case "percent0":
      return `${v.toFixed(0)}%`;
    case "percent1":
      return `${v.toFixed(1)}%`;
    case "minutes1":
      return `${v.toFixed(1)}m`;
    case "integer":
    default:
      return String(Math.round(v));
  }
}

interface RankedHBarChartProps {
  data: RankedBarDatum[];
  maxValue?: number;
  valueFormat?: RankedValueFormat;
  chartTitle?: string;
  /** Used when a row has no `color` */
  accentColor?: string;
  /** Bar thickness affects total height */
  barSize?: number;
  /** Threshold / legend note below chart */
  caption?: string;
}

function RankedTooltip({
  active,
  payload,
  formatValue,
}: {
  active?: boolean;
  payload?: Array<{ payload: RankedBarDatum; value: number }>;
  formatValue: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-md border border-ttl-border bg-ttl-surface px-3 py-2 text-fluid-xs shadow-lg">
      <p className="font-bold text-primary mb-1">{d.label}</p>
      <p className="text-secondary">{formatValue(d.value)}</p>
    </div>
  );
}

export default function RankedHBarChart({
  data,
  maxValue,
  valueFormat = "integer",
  chartTitle,
  accentColor = "var(--color-chart-2)",
  barSize = 22,
  caption,
}: RankedHBarChartProps) {
  const formatValue = (v: number) => formatByPreset(v, valueFormat);

  if (data.length === 0) {
    return (
      <p className="text-fluid-sm text-muted px-1 py-8 text-center">
        No data to plot.
      </p>
    );
  }

  const max =
    maxValue ??
    Math.max(...data.map((d) => d.value), 1);
  const height = Math.min(560, 56 + data.length * (barSize + 10));

  return (
    <div className="w-full">
      {chartTitle && (
        <p className="text-fluid-sm font-bold text-primary mb-3 px-1">{chartTitle}</p>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 28, bottom: 4, left: 4 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border-subtle)"
            horizontal={false}
          />
          <XAxis
            type="number"
            domain={[0, max]}
            tickFormatter={(v: number) => formatValue(v)}
            stroke="var(--color-text-muted)"
            fontSize={11}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={112}
            stroke="var(--color-text-muted)"
            fontSize={11}
            tickFormatter={(v: string) =>
              v.length > 15 ? `${v.slice(0, 14)}...` : v
            }
          />
          <Tooltip
            content={(props: Record<string, unknown>) => (
              <RankedTooltip
                active={props.active as boolean | undefined}
                payload={
                  props.payload as
                    | Array<{ payload: RankedBarDatum; value: number }>
                    | undefined
                }
                formatValue={formatValue}
              />
            )}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={barSize}>
            {data.map((entry, i) => (
              <Cell
                key={`${entry.label}-${i}`}
                fill={entry.color ?? accentColor}
                opacity={0.88}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {caption && (
        <p className="text-fluid-xs text-muted mt-3 leading-relaxed px-1">{caption}</p>
      )}
    </div>
  );
}
