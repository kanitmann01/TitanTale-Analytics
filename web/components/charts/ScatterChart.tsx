"use client";

import { useState } from "react";

interface ScatterDatum {
  label: string;
  x: number;
  y: number;
  size?: number;
  /** Total games (shown in tooltip and legend) */
  games?: number;
}

type FormatType = "integer" | "percent" | "decimal";

function formatVal(v: number, type: FormatType): string {
  switch (type) {
    case "percent":
      return `${(v * 100).toFixed(0)}%`;
    case "decimal":
      return `${v.toFixed(1)}%`;
    case "integer":
    default:
      return String(Math.round(v));
  }
}

interface ScatterChartProps {
  data: ScatterDatum[];
  xLabel: string;
  yLabel: string;
  xFormatType?: FormatType;
  yFormatType?: FormatType;
  color?: string;
}

export default function ScatterChart({
  data,
  xLabel,
  yLabel,
  xFormatType = "integer",
  yFormatType = "percent",
  color = "var(--color-chart-1)",
}: ScatterChartProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const padding = { top: 20, right: 24, bottom: 52, left: 54 };
  const width = 560;
  const height = 340;
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const xs = data.map((d) => d.x);
  const ys = data.map((d) => d.y);
  const xMin = Math.min(...xs) * 0.98;
  const xMax = Math.max(...xs) * 1.02;
  const yMin = Math.min(...ys) * 0.9;
  const yMax = Math.max(...ys) * 1.05;

  const scaleX = (v: number) =>
    padding.left + ((v - xMin) / (xMax - xMin)) * plotW;
  const scaleY = (v: number) =>
    padding.top + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

  const xTicks = 5;
  const yTicks = 5;

  const gameVals = data.map((d) => d.games).filter((g): g is number => g != null);
  const minG = gameVals.length ? Math.min(...gameVals) : 0;
  const maxG = gameVals.length ? Math.max(...gameVals) : 0;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full touch-manipulation"
        style={{ maxHeight: `${height}px` }}
        role="img"
        aria-label={`Scatter plot: ${xLabel} vs ${yLabel}`}
      >
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const val = yMin + ((yMax - yMin) / yTicks) * i;
          const y = scaleY(val);
          return (
            <g key={`y-${i}`}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="var(--color-border-subtle)"
                strokeWidth={1}
              />
              <text
                x={padding.left - 8}
                y={y}
                textAnchor="end"
                dominantBaseline="central"
                fill="var(--color-text-muted)"
                fontSize="10"
                fontFamily="var(--font-body)"
              >
                {formatVal(val, yFormatType)}
              </text>
            </g>
          );
        })}
        {Array.from({ length: xTicks + 1 }).map((_, i) => {
          const val = xMin + ((xMax - xMin) / xTicks) * i;
          const x = scaleX(val);
          return (
            <text
              key={`x-${i}`}
              x={x}
              y={height - padding.bottom + 18}
              textAnchor="middle"
              fill="var(--color-text-muted)"
              fontSize="10"
              fontFamily="var(--font-body)"
            >
              {formatVal(val, xFormatType)}
            </text>
          );
        })}

        <text
          x={width / 2}
          y={height - 4}
          textAnchor="middle"
          fill="var(--color-text-muted)"
          fontSize="11"
          fontFamily="var(--font-body)"
        >
          {xLabel}
        </text>
        <text
          x={12}
          y={height / 2}
          textAnchor="middle"
          fill="var(--color-text-muted)"
          fontSize="11"
          fontFamily="var(--font-body)"
          transform={`rotate(-90, 12, ${height / 2})`}
        >
          {yLabel}
        </text>

        {data
          .filter((d) => d.label !== hovered)
          .map((d) => {
            const cx = scaleX(d.x);
            const cy = scaleY(d.y);
            const r = d.size ?? 5;
            const hitR = Math.max(r, 14);
            return (
              <g key={d.label}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={hitR}
                  fill="transparent"
                  onMouseEnter={() => setHovered(d.label)}
                  onMouseLeave={() => setHovered(null)}
                  onTouchStart={() => setHovered(d.label)}
                  style={{ cursor: "default", touchAction: "manipulation" }}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={color}
                  opacity={hovered ? 0.35 : 0.7}
                  pointerEvents="none"
                  style={{ transition: "opacity 0.2s ease-out" }}
                />
              </g>
            );
          })}

        {data
          .filter((d) => d.label === hovered)
          .map((d) => {
            const cx = scaleX(d.x);
            const cy = scaleY(d.y);
            const r = (d.size ?? 5) + 2;
            const tooltipX = cx + r + 8;
            const tooltipY = cy - 14;
            const xVal = formatVal(d.x, xFormatType);
            const yVal = formatVal(d.y, yFormatType);
            const line1 = d.label;
            const line2 = `${xLabel}: ${xVal}`;
            const line3 = `${yLabel}: ${yVal}`;
            const line4 =
              d.games !== undefined ? `Games: ${d.games}` : null;
            const lines = [line1, line2, line3, ...(line4 ? [line4] : [])];
            const boxWidth =
              Math.max(...lines.map((l) => l.length)) * 6.5 + 20;
            const boxHeight = 14 + lines.length * 14;
            const flipped = tooltipX + boxWidth > width - 10;
            const tx = flipped ? cx - r - 8 - boxWidth : tooltipX;

            return (
              <g
                key={d.label}
                onMouseEnter={() => setHovered(d.label)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "default" }}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={r + 4}
                  fill={color}
                  opacity={0.15}
                />
                <circle cx={cx} cy={cy} r={r} fill={color} opacity={1} />
                <rect
                  x={tx}
                  y={tooltipY - 4}
                  width={boxWidth}
                  height={boxHeight}
                  rx={5}
                  fill="var(--color-bg-surface)"
                  stroke="var(--color-border)"
                  strokeWidth={1}
                />
                {lines.map((line, i) => (
                  <text
                    key={line}
                    x={tx + 8}
                    y={tooltipY + 8 + i * 14}
                    fill={
                      i === 0
                        ? "var(--color-text)"
                        : "var(--color-text-secondary)"
                    }
                    fontSize={i === 0 ? 11 : 9.5}
                    fontWeight={i === 0 ? "700" : "400"}
                    fontFamily="var(--font-body)"
                  >
                    {line}
                  </text>
                ))}
              </g>
            );
          })}
      </svg>
      {gameVals.length > 0 && (
        <p className="text-fluid-xs text-muted mt-2 leading-relaxed">
          Dot size scales with games played (about {minG}
          {minG !== maxG ? ` to ${maxG}` : ""} in this view). Larger dots mean
          more games.
        </p>
      )}
    </div>
  );
}
