/**
 * Consistent eyebrow label for page sections (uppercase, tracked).
 */
export default function PageLabel({
  children,
  gold,
  className = "",
}: {
  children: React.ReactNode;
  gold?: boolean;
  className?: string;
}) {
  return (
    <p
      className={`section-label ${gold ? "section-label-gold" : ""} ${className}`.trim()}
    >
      {children}
    </p>
  );
}
