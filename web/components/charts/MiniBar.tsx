/**
 * Inline mini bar for use inside table cells or stat lines.
 * Width-percentage driven, no SVG needed.
 */
interface MiniBarProps {
  /** 0-1 fraction. */
  value: number;
  /** Bar fill color. */
  color?: string;
  /** Track color. */
  trackColor?: string;
  className?: string;
}

export default function MiniBar({
  value,
  color = "var(--color-chart-1)",
  trackColor = "var(--color-border-subtle)",
  className = "",
}: MiniBarProps) {
  const pct = Math.max(0, Math.min(value * 100, 100));
  return (
    <div
      className={`h-1.5 rounded-full overflow-hidden ${className}`}
      style={{ background: trackColor }}
    >
      <div
        className="h-full rounded-full anim-bar-grow"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}
