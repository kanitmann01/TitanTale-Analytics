"use client";

import { useState } from "react";

interface ScatterDatum {
  label: string;
  x: number;
  y: number;
  size?: number;
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

  const padding = { top: 20, right: 24, bottom: 44, left: 54 };
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

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ maxHeight: `${height}px` }}
      role="img"
      aria-label={`Scatter plot: ${xLabel} vs ${yLabel}`}
    >
      {/* Grid lines */}
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
            y={height - padding.bottom + 20}
            textAnchor="middle"
            fill="var(--color-text-muted)"
            fontSize="10"
            fontFamily="var(--font-body)"
          >
            {formatVal(val, xFormatType)}
          </text>
        );
      })}

      {/* Axis labels */}
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

      {/* Points -- non-hovered first, hovered on top */}
      {data
        .filter((d) => d.label !== hovered)
        .map((d) => {
          const cx = scaleX(d.x);
          const cy = scaleY(d.y);
          const r = d.size ?? 5;
          return (
            <circle
              key={d.label}
              cx={cx}
              cy={cy}
              r={r}
              fill={color}
              opacity={hovered ? 0.35 : 0.7}
              onMouseEnter={() => setHovered(d.label)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "default", transition: "opacity 0.2s ease-out" }}
            />
          );
        })}

      {/* Hovered point + rich tooltip */}
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
          const boxWidth = Math.max(line1.length, line2.length, line3.length) * 6.5 + 20;
          const boxHeight = 46;
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
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={color}
                opacity={1}
              />
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
              <text
                x={tx + 8}
                y={tooltipY + 8}
                fill="var(--color-text)"
                fontSize="11"
                fontWeight="700"
                fontFamily="var(--font-body)"
              >
                {line1}
              </text>
              <text
                x={tx + 8}
                y={tooltipY + 22}
                fill="var(--color-text-secondary)"
                fontSize="9.5"
                fontFamily="var(--font-body)"
              >
                {line2}
              </text>
              <text
                x={tx + 8}
                y={tooltipY + 34}
                fill="var(--color-text-secondary)"
                fontSize="9.5"
                fontFamily="var(--font-body)"
              >
                {line3}
              </text>
            </g>
          );
        })}
    </svg>
  );
}
