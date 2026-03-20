"use client";

import { useMemo, useState } from "react";

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
  /** When set, hide cells with count below this (affinity use). */
  minCount?: number;
  /** Show gradient legend for value range */
  showLegend?: boolean;
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
  minCount = 0,
  showLegend = false,
}: HeatmapChartProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const hoveredRow = hovered?.split("|")[0] ?? null;
  const hoveredCol = hovered?.split("|")[1] ?? null;

  const { cellMap, minVal, maxVal } = useMemo(() => {
    const m = new Map<string, HeatmapCell>();
    let minV = Infinity;
    let maxV = -Infinity;
    for (const cell of data) {
      if (
        minCount > 0 &&
        cell.count !== undefined &&
        cell.count < minCount
      ) {
        continue;
      }
      m.set(`${cell.row}|${cell.col}`, cell);
      if (cell.value < minV) {
        minV = cell.value;
      }
      if (cell.value > maxV) {
        maxV = cell.value;
      }
    }
    if (!Number.isFinite(minV)) {
      minV = 0;
      maxV = 1;
    }
    return { cellMap: m, minVal: minV, maxVal: maxV };
  }, [data, minCount]);

  const labelW = 90;
  const headerH = 80;
  const totalW = labelW + cols.length * cellSize;
  const totalH = headerH + rows.length * cellSize;

  return (
    <div className="overflow-x-auto min-w-0">
      {title && <p className="text-fluid-xs text-muted mb-2">{title}</p>}
      <svg
        viewBox={`0 0 ${totalW} ${totalH}`}
        className="w-full"
        style={{ maxHeight: `${totalH}px`, minWidth: `${totalW}px` }}
      >
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
            {col.length > 10 ? `${col.slice(0, 9)}..` : col}
          </text>
        ))}

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
              {row.length > 12 ? `${row.slice(0, 11)}..` : row}
            </text>
            {cols.map((col, ci) => {
              const key = `${row}|${col}`;
              const cell = cellMap.get(key);
              const inCross =
                (hoveredRow !== null && row === hoveredRow) ||
                (hoveredCol !== null && col === hoveredCol);
              if (!cell) {
                return (
                  <g key={col}>
                    <title>
                      {row} vs {col}: no matches played
                    </title>
                    <rect
                      x={labelW + ci * cellSize}
                      y={headerH + ri * cellSize}
                      width={cellSize - 1}
                      height={cellSize - 1}
                      fill="var(--color-bg-surface)"
                      opacity={inCross ? 0.95 : 0.75}
                      stroke={
                        inCross ? "var(--color-gold)" : "var(--color-border)"
                      }
                      strokeWidth={inCross ? 1 : 0.5}
                      rx={2}
                    />
                    <text
                      x={labelW + ci * cellSize + (cellSize - 1) / 2}
                      y={headerH + ri * cellSize + (cellSize - 1) / 2}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="10"
                      fill="var(--color-text-muted)"
                    >
                      -
                    </text>
                  </g>
                );
              }
              const isHovered = hovered === key;
              const bg = interpolateColor(
                cell.value,
                minVal,
                maxVal,
                colorScale,
              );
              const lowSample =
                cell.count !== undefined && cell.count < 5;
              return (
                <g
                  key={col}
                  onMouseEnter={() => setHovered(key)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "default" }}
                >
                  <title>
                    {row} vs {col}
                    {cell.label ? `: ${cell.label}` : ""}
                    {cell.count !== undefined ? ` (${cell.count} games)` : ""}
                  </title>
                  <rect
                    x={labelW + ci * cellSize}
                    y={headerH + ri * cellSize}
                    width={cellSize - 1}
                    height={cellSize - 1}
                    fill={bg}
                    rx={2}
                    opacity={isHovered ? 1 : inCross ? 0.95 : 0.88}
                    stroke={
                      isHovered
                        ? "var(--color-text)"
                        : inCross
                          ? "var(--color-gold)"
                          : "none"
                    }
                    strokeWidth={isHovered ? 1.5 : inCross ? 0.8 : 0}
                  />
                  {lowSample && (
                    <line
                      x1={labelW + ci * cellSize}
                      y1={headerH + ri * cellSize}
                      x2={labelW + ci * cellSize + cellSize - 1}
                      y2={headerH + ri * cellSize + cellSize - 1}
                      stroke="var(--color-text-muted)"
                      strokeWidth={0.6}
                      opacity={0.5}
                    />
                  )}
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
                </g>
              );
            })}
          </g>
        ))}
      </svg>
      {showLegend && (
        <div className="mt-3 flex items-center gap-3 text-fluid-xs text-muted">
          <span className="shrink-0">Scale</span>
          <div
            className="h-2 flex-1 max-w-xs rounded"
            style={{
              background: `linear-gradient(90deg, ${colorScale.min}, ${colorScale.mid}, ${colorScale.max})`,
            }}
          />
          <span className="tabular-nums shrink-0">
            {valueFormat(minVal)} to {valueFormat(maxVal)}
          </span>
        </div>
      )}
    </div>
  );
}
