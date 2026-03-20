/**
 * Horizontal bar chart rendered as pure SVG.
 * Server-component safe -- no client state needed.
 */

interface HBarDatum {
  label: string;
  value: number;
  /** Optional color override (CSS color string). */
  color?: string;
}

interface HBarChartProps {
  data: HBarDatum[];
  /** Max value for the axis. Defaults to max in data. */
  maxValue?: number;
  /** Bar height in px. */
  barHeight?: number;
  /** Format the value label. */
  formatValue?: (v: number) => string;
  /** Accent color when no per-bar color is set. */
  accentColor?: string;
  /** Legend or threshold note below chart */
  caption?: string;
}

export default function HBarChart({
  data,
  maxValue,
  barHeight = 24,
  formatValue = (v) => String(v),
  accentColor = "var(--color-chart-1)",
  caption,
}: HBarChartProps) {
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);
  const gap = 6;
  const labelWidth = 110;
  const valueWidth = 56;
  const chartWidth = 600;
  const totalHeight = data.length * (barHeight + gap) - gap;

  return (
    <div className="w-full">
    <svg
      viewBox={`0 0 ${chartWidth} ${totalHeight}`}
      className="w-full"
      style={{ maxHeight: `${totalHeight}px` }}
      role="img"
      aria-label="Horizontal bar chart"
    >
      {data.map((d, i) => {
        const y = i * (barHeight + gap);
        const barMaxWidth = chartWidth - labelWidth - valueWidth - 16;
        const barWidth = max > 0 ? (d.value / max) * barMaxWidth : 0;
        const fill = d.color ?? accentColor;
        return (
          <g key={d.label}>
            <text
              x={labelWidth - 8}
              y={y + barHeight / 2}
              textAnchor="end"
              dominantBaseline="central"
              fill="var(--color-text-secondary)"
              fontSize="11"
              fontFamily="var(--font-body)"
            >
              {d.label.length > 14 ? d.label.slice(0, 13) + "..." : d.label}
            </text>
            <rect
              x={labelWidth}
              y={y + 2}
              width={barMaxWidth}
              height={barHeight - 4}
              rx={3}
              fill="var(--color-border-subtle)"
            />
            <rect
              x={labelWidth}
              y={y + 2}
              width={Math.max(barWidth, 2)}
              height={barHeight - 4}
              rx={3}
              fill={fill}
              opacity={0.85}
              className="anim-bar-grow"
              style={{ animationDelay: `${i * 0.03}s` }}
            />
            <text
              x={labelWidth + barMaxWidth + 8}
              y={y + barHeight / 2}
              dominantBaseline="central"
              fill="var(--color-text)"
              fontSize="11"
              fontWeight="600"
              fontFamily="var(--font-body)"
            >
              {formatValue(d.value)}
            </text>
          </g>
        );
      })}
    </svg>
    {caption && (
      <p className="text-fluid-xs text-muted mt-2 leading-relaxed">{caption}</p>
    )}
    </div>
  );
}
