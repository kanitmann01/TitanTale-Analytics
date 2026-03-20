"use client";

import { useState } from "react";

interface HeatmapCell {
  row: string;
  col: string;
  value: number;
  label?: string;
  count?: number;
}

interface HeatmapChartProps {
  data: HeatmapCell[];
  rows: string[];
  cols: string[];
  colorScale?: { min: string; mid: string; max: string };
  valueFormat?: (v: number) => string;
  cellSize?: number;
  title?: string;
}

function interpolateColor(
  value: number,
  min: number,
  max: number,
  colors: { min: string; mid: string; max: string },
): string {
  const mid = (min + max) / 2;
  if (value <= mid) {
    const t = min === mid ? 0 : (value - min) / (mid - min);
    return blendHex(colors.min, colors.mid, t);
  }
  const t = mid === max ? 1 : (value - mid) / (max - mid);
  return blendHex(colors.mid, colors.max, t);
}

function blendHex(a: string, b: string, t: number): string {
  const pa = parseHex(a);
  const pb = parseHex(b);
  const r = Math.round(pa[0] + (pb[0] - pa[0]) * t);
  const g = Math.round(pa[1] + (pb[1] - pa[1]) * t);
  const bl = Math.round(pa[2] + (pb[2] - pa[2]) * t);
  return `rgb(${r},${g},${bl})`;
}

function parseHex(hex: string): [number, number, number] {
  hex = hex.replace("#", "");
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ];
}

export default function HeatmapChart({
  data,
  rows,
  cols,
  colorScale = { min: "#ef4444", mid: "#1e293b", max: "#22c55e" },
  valueFormat = (v) => `${(v * 100).toFixed(0)}%`,
  cellSize = 36,
  title,
}: HeatmapChartProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const cellMap = new Map<string, HeatmapCell>();
  let minVal = Infinity;
  let maxVal = -Infinity;
  for (const cell of data) {
    cellMap.set(`${cell.row}|${cell.col}`, cell);
    if (cell.value < minVal) minVal = cell.value;
    if (cell.value > maxVal) maxVal = cell.value;
  }

  const labelW = 90;
  const headerH = 80;
  const totalW = labelW + cols.length * cellSize;
  const totalH = headerH + rows.length * cellSize;

  return (
    <div className="overflow-x-auto">
      {title && (
        <p className="text-fluid-xs text-muted mb-2">{title}</p>
      )}
      <svg
        viewBox={`0 0 ${totalW} ${totalH}`}
        className="w-full"
        style={{ maxHeight: `${totalH}px`, minWidth: `${totalW}px` }}
      >
        {/* Column headers */}
        {cols.map((col, ci) => (
          <text
            key={col}
            x={labelW + ci * cellSize + cellSize / 2}
            y={headerH - 6}
            textAnchor="end"
            fontSize="9"
            fill="var(--color-text-muted)"
            transform={`rotate(-45, ${labelW + ci * cellSize + cellSize / 2}, ${headerH - 6})`}
          >
            {col.length > 10 ? col.slice(0, 9) + ".." : col}
          </text>
        ))}

        {/* Row labels + cells */}
        {rows.map((row, ri) => (
          <g key={row}>
            <text
              x={labelW - 6}
              y={headerH + ri * cellSize + cellSize / 2}
              textAnchor="end"
              dominantBaseline="central"
              fontSize="9"
              fill="var(--color-text-secondary)"
            >
              {row.length > 12 ? row.slice(0, 11) + ".." : row}
            </text>
            {cols.map((col, ci) => {
              const cell = cellMap.get(`${row}|${col}`);
              if (!cell) {
                return (
                  <rect
                    key={col}
                    x={labelW + ci * cellSize}
                    y={headerH + ri * cellSize}
                    width={cellSize - 1}
                    height={cellSize - 1}
                    fill="var(--color-bg-surface)"
                    rx={2}
                  />
                );
              }
              const key = `${row}|${col}`;
              const isHovered = hovered === key;
              const bg = interpolateColor(cell.value, minVal, maxVal, colorScale);
              return (
                <g
                  key={col}
                  onMouseEnter={() => setHovered(key)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "default" }}
                >
                  <rect
                    x={labelW + ci * cellSize}
                    y={headerH + ri * cellSize}
                    width={cellSize - 1}
                    height={cellSize - 1}
                    fill={bg}
                    rx={2}
                    opacity={isHovered ? 1 : 0.85}
                    stroke={isHovered ? "var(--color-text)" : "none"}
                    strokeWidth={isHovered ? 1.5 : 0}
                  />
                  {cellSize >= 30 && (
                    <text
                      x={labelW + ci * cellSize + (cellSize - 1) / 2}
                      y={headerH + ri * cellSize + (cellSize - 1) / 2}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="8"
                      fill="white"
                      fontWeight={isHovered ? "700" : "400"}
                    >
                      {cell.label ?? valueFormat(cell.value)}
                    </text>
                  )}
                  {isHovered && cell.count !== undefined && (
                    <text
                      x={labelW + ci * cellSize + (cellSize - 1) / 2}
                      y={headerH + ri * cellSize + cellSize + 10}
                      textAnchor="middle"
                      fontSize="8"
                      fill="var(--color-text-muted)"
                    >
                      n={cell.count}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
}
