import { Suspense } from "react";
import type { SeasonId } from "@/lib/season-types";
import SiteNav from "@/components/SiteNav";

function NavFallback() {
  return (
    <div
      className="sticky top-0 z-40 h-12 border-b border-ttl-border-subtle bg-ttl-navy/85 backdrop-blur-lg"
      aria-hidden
    />
  );
}

interface NavShellProps {
  seasons: SeasonId[];
  currentSeason: SeasonId;
}

export default function NavShell({ seasons, currentSeason }: NavShellProps) {
  return (
    <Suspense fallback={<NavFallback />}>
      <SiteNav seasons={seasons} currentSeason={currentSeason} />
    </Suspense>
  );
}
