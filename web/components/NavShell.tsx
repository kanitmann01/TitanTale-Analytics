import { Suspense } from "react";
import type { SeasonId } from "@/lib/season-types";
import SiteNav from "@/components/SiteNav";

function NavFallback() {
  return (
    <div
      className="sticky top-0 z-40 flex min-h-[3.5rem] items-center border-b border-ttl-border-subtle bg-ttl-navy/85 px-4 pt-[max(0px,env(safe-area-inset-top))] backdrop-blur-lg md:min-h-12"
      aria-hidden
    >
      <div className="h-8 w-28 max-w-full rounded bg-ttl-slate/50" />
      <div className="ml-auto flex items-center gap-2">
        <div className="h-9 w-24 rounded border border-ttl-border bg-ttl-slate/40" />
        <div className="h-11 w-11 rounded border border-ttl-border-subtle bg-ttl-slate/40 md:hidden" />
      </div>
    </div>
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
