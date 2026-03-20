"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Overview" },
  { href: "/players", label: "Players" },
  { href: "/civilizations", label: "Civilizations" },
  { href: "/maps", label: "Maps" },
  { href: "/matchups", label: "Matchups" },
  { href: "/analysis", label: "Analysis" },
  { href: "/research", label: "Research" },
];

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 border-b border-ttl-border-subtle bg-ttl-navy/85 backdrop-blur-lg">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-12">
        <Link
          href="/"
          className="font-display text-fluid-sm font-bold tracking-wider text-ttl-gold hover:text-ttl-gold-light transition-colors shrink-0"
        >
          TTL Stats
        </Link>

        <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none ml-6 -mr-2 pr-2">
          {links.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-1.5 rounded text-fluid-xs whitespace-nowrap transition-colors ${
                  isActive
                    ? "text-ttl-gold"
                    : "text-muted hover:text-secondary"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-ttl-gold" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
