"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface RadarDatum {
  axis: string;
  [playerKey: string]: string | number;
}

interface RadarPlayerSeries {
  dataKey: string;
  name: string;
  color: string;
}

interface RadarCompareProps {
  data: RadarDatum[];
  players: RadarPlayerSeries[];
  height?: number;
}

function RadarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-ttl-border bg-ttl-surface px-3 py-2 text-fluid-xs shadow-lg">
      <p className="font-bold text-primary mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.stroke }}>
          {p.name}: {typeof p.value === "number" ? `${(p.value * 100).toFixed(0)}%` : p.value}
        </p>
      ))}
    </div>
  );
}

export default function RadarCompare({
  data,
  players,
  height = 380,
}: RadarCompareProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke="var(--color-border-subtle)" />
        <PolarAngleAxis
          dataKey="axis"
          stroke="var(--color-text-muted)"
          fontSize={10}
          tick={{ fill: "var(--color-text-secondary)" }}
        />
        <PolarRadiusAxis
          angle={90}
          stroke="var(--color-border-subtle)"
          fontSize={9}
          tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
        />
        <Tooltip content={<RadarTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: "11px", color: "var(--color-text-secondary)" }}
        />
        {players.map((p) => (
          <Radar
            key={p.dataKey}
            name={p.name}
            dataKey={p.dataKey}
            stroke={p.color}
            fill={p.color}
            fillOpacity={0.15}
            strokeWidth={2}
          />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  );
}
