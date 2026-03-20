import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found | TTL Stats",
  description:
    "We could not find that page. Return to overview or browse players and maps.",
};

export default function NotFound() {
  return (
    <main className="min-h-[60vh] max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-20 pb-[max(4rem,env(safe-area-inset-bottom))]">
      <p className="section-label-gold mb-4">404</p>
      <h1 className="font-display text-fluid-2xl font-bold text-primary mb-4">
        Page not found
      </h1>
      <p className="text-secondary text-fluid-base max-w-md mb-10 leading-relaxed">
        That link is not valid on this site, or the page may have moved. Use
        the links below to keep exploring the data.
      </p>
      <div className="flex flex-wrap gap-4">
        <Link
          href="/"
          className="cta-shimmer btn-press inline-flex items-center justify-center min-h-11 rounded border border-ttl-gold/40 bg-ttl-gold/10 px-5 py-2.5 text-fluid-sm text-ttl-gold hover:bg-ttl-gold/20 hover:border-ttl-gold/50"
        >
          Back to overview
        </Link>
        <Link
          href="/players"
          className="btn-press inline-flex items-center justify-center min-h-11 rounded border border-ttl-border-subtle px-5 py-2.5 text-fluid-sm text-secondary hover:text-primary hover:border-ttl-accent/30"
        >
          Players
        </Link>
        <Link
          href="/maps"
          className="btn-press inline-flex items-center justify-center min-h-11 rounded border border-ttl-border-subtle px-5 py-2.5 text-fluid-sm text-secondary hover:text-primary hover:border-ttl-accent/30"
        >
          Maps
        </Link>
      </div>
    </main>
  );
}
