"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Label,
  Cell,
} from "recharts";

interface ResidualDatum {
  label: string;
  expected: number;
  residual: number;
  tier?: string;
}

interface ResidualChartProps {
  data: ResidualDatum[];
  xLabel?: string;
  yLabel?: string;
}

const TIER_COLORS: Record<string, string> = {
  Elite: "var(--color-chart-1)",
  Strong: "var(--color-chart-4)",
  Average: "var(--color-chart-2)",
  Struggling: "var(--color-chart-5)",
};

function ResidualTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as ResidualDatum;
  const sign = d.residual >= 0 ? "+" : "";
  return (
    <div className="rounded-md border border-ttl-border bg-ttl-surface px-3 py-2 text-fluid-xs shadow-lg">
      <p className="font-bold text-primary mb-1">{d.label}</p>
      <p className="text-secondary">
        Expected: {(d.expected * 100).toFixed(1)}%
      </p>
      <p className={d.residual >= 0 ? "text-ttl-win" : "text-ttl-loss"}>
        Delta: {sign}{(d.residual * 100).toFixed(1)}%
      </p>
      {d.tier && <p className="text-muted mt-0.5">{d.tier}</p>}
    </div>
  );
}

export default function ResidualChart({
  data,
  xLabel = "Expected Win Rate",
  yLabel = "Residual (Actual - Expected)",
}: ResidualChartProps) {
  return (
    <ResponsiveContainer width="100%" height={340}>
      <ScatterChart margin={{ top: 10, right: 20, bottom: 40, left: 20 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--color-border-subtle)"
        />
        <XAxis
          type="number"
          dataKey="expected"
          domain={["auto", "auto"]}
          tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
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
          dataKey="residual"
          tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
          stroke="var(--color-text-muted)"
          fontSize={11}
        >
          <Label
            value={yLabel}
            angle={-90}
            position="insideLeft"
            offset={-5}
            style={{ fill: "var(--color-text-muted)", fontSize: 11 }}
          />
        </YAxis>
        <ReferenceLine
          y={0}
          stroke="var(--color-text-muted)"
          strokeDasharray="4 4"
        />
        <Tooltip content={<ResidualTooltip />} />
        <Scatter data={data} fill="var(--color-chart-1)">
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={TIER_COLORS[d.tier ?? "Average"] ?? "var(--color-chart-2)"}
            />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
