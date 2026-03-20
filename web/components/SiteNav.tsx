"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SeasonId } from "@/lib/season-types";
import SeasonSelect from "@/components/SeasonSelect";

const links = [
  { href: "/", label: "Overview" },
  { href: "/players", label: "Players" },
  { href: "/civilizations", label: "Civilizations" },
  { href: "/maps", label: "Maps" },
  { href: "/matchups", label: "Matchups" },
  { href: "/analysis", label: "Analysis" },
  { href: "/research", label: "Research" },
];

interface SiteNavProps {
  seasons: SeasonId[];
  currentSeason: SeasonId;
}

export default function SiteNav({ seasons, currentSeason }: SiteNavProps) {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 border-b border-ttl-border-subtle bg-ttl-navy/85 backdrop-blur-lg">
      <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-wrap items-center justify-between gap-y-2 min-h-12 py-1.5">
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/"
            className="font-display text-fluid-sm font-bold tracking-wider text-ttl-gold hover:text-ttl-gold-light transition-colors"
          >
            TTL Stats
          </Link>
          <SeasonSelect seasons={seasons} currentSeason={currentSeason} />
        </div>

        <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none -mr-2 pr-2 max-w-full">
          {links.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-2.5 md:px-3 py-1.5 rounded text-fluid-xs whitespace-nowrap transition-colors ${
                  isActive
                    ? "text-ttl-gold"
                    : "text-muted hover:text-primary hover:bg-ttl-surface/40"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-2.5 right-2.5 md:left-3 md:right-3 h-[2px] rounded-full bg-ttl-gold" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
