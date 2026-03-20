/**
 * SVG donut chart with segment gaps and responsive sizing.
 */

interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}

export default function DonutChart({
  data,
  size = 180,
  thickness = 28,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;
  const gapDeg = 2;
  const gapFraction = gapDeg / 360;
  const gapLength = gapFraction * circumference;

  let accumulated = 0;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full"
      style={{ maxWidth: `${size}px` }}
      role="img"
      aria-label="Donut chart"
    >
      {data.map((slice) => {
        const fraction = slice.value / total;
        const dashLength = Math.max(0, fraction * circumference - gapLength);
        const dashGap = circumference - dashLength;
        const offset =
          -(accumulated * circumference + gapLength / 2) +
          circumference * 0.25;
        accumulated += fraction;
        return (
          <circle
            key={slice.label}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={slice.color}
            strokeWidth={thickness}
            strokeDasharray={`${dashLength} ${dashGap}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            opacity={0.88}
          />
        );
      })}
      {centerLabel && (
        <>
          <text
            x={cx}
            y={cy - 6}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--color-text)"
            fontSize="22"
            fontWeight="700"
            fontFamily="var(--font-display)"
          >
            {centerValue}
          </text>
          <text
            x={cx}
            y={cy + 16}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--color-text-muted)"
            fontSize="10"
            fontFamily="var(--font-body)"
          >
            {centerLabel}
          </text>
        </>
      )}
    </svg>
  );
}
