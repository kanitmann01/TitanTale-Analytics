"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface BarSeries {
  dataKey: string;
  name: string;
  color: string;
}

interface GroupedBarChartProps {
  data: Record<string, string | number>[];
  categoryKey: string;
  series: BarSeries[];
  height?: number;
  formatValue?: (v: number) => string;
  layout?: "horizontal" | "vertical";
}

function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-ttl-border bg-ttl-surface px-3 py-2 text-fluid-xs shadow-lg">
      <p className="font-bold text-primary mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.fill }} className="text-secondary">
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  );
}

export default function GroupedBarChart({
  data,
  categoryKey,
  series,
  height = 320,
  layout = "vertical",
}: GroupedBarChartProps) {
  if (layout === "horizontal") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
          <XAxis dataKey={categoryKey} stroke="var(--color-text-muted)" fontSize={11} />
          <YAxis stroke="var(--color-text-muted)" fontSize={11} />
          <Tooltip content={<BarTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "11px", color: "var(--color-text-secondary)" }}
          />
          {series.map((s) => (
            <Bar key={s.dataKey} dataKey={s.dataKey} name={s.name} fill={s.color} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 20, bottom: 5, left: 80 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
        <XAxis type="number" stroke="var(--color-text-muted)" fontSize={11} />
        <YAxis
          type="category"
          dataKey={categoryKey}
          stroke="var(--color-text-muted)"
          fontSize={11}
          width={75}
        />
        <Tooltip content={<BarTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: "11px", color: "var(--color-text-secondary)" }}
        />
        {series.map((s) => (
          <Bar key={s.dataKey} dataKey={s.dataKey} name={s.name} fill={s.color} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
