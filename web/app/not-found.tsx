import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found | TTL Stats",
  description: "The requested page could not be found.",
};

export default function NotFound() {
  return (
    <main className="min-h-[60vh] max-w-6xl mx-auto px-6 py-20">
      <p className="section-label-gold mb-4">404</p>
      <h1 className="font-display text-fluid-2xl font-bold text-primary mb-4">
        Page not found
      </h1>
      <p className="text-secondary text-fluid-base max-w-md mb-10 leading-relaxed">
        This route does not exist, or the resource may have been removed.
      </p>
      <div className="flex flex-wrap gap-4">
        <Link
          href="/"
          className="inline-flex items-center rounded border border-ttl-gold/40 bg-ttl-gold/10 px-4 py-2 text-fluid-sm text-ttl-gold hover:bg-ttl-gold/20 transition-colors"
        >
          Back to overview
        </Link>
        <Link
          href="/players"
          className="inline-flex items-center rounded border border-ttl-border-subtle px-4 py-2 text-fluid-sm text-secondary hover:text-primary transition-colors"
        >
          Players
        </Link>
        <Link
          href="/maps"
          className="inline-flex items-center rounded border border-ttl-border-subtle px-4 py-2 text-fluid-sm text-secondary hover:text-primary transition-colors"
        >
          Maps
        </Link>
      </div>
    </main>
  );
}
