"use client";

import { Suspense, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { SeasonId } from "@/lib/season-types";

interface SeasonSelectProps {
  seasons: SeasonId[];
  currentSeason: SeasonId;
}

function SeasonSelectInner({
  seasons,
  currentSeason,
}: SeasonSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onChange = useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("season", next);
      const q = params.toString();
      router.push(q ? `${pathname}?${q}` : pathname);
      router.refresh();
    },
    [pathname, router, searchParams],
  );

  if (seasons.length <= 1) {
    return null;
  }

  return (
    <label className="flex items-center gap-2 shrink-0 text-fluid-xs text-muted min-h-11 sm:min-h-0">
      <span className="sr-only">Tournament season</span>
      <select
        value={currentSeason}
        onChange={(e) => onChange(e.target.value)}
        className="select-interactive min-h-11 sm:min-h-8 h-11 sm:h-8 rounded border border-ttl-border bg-ttl-slate px-3 sm:px-2 text-fluid-sm sm:text-fluid-xs text-primary focus:outline-none focus:ring-2 focus:ring-ttl-accent/40 focus:border-ttl-accent/50 max-w-[11rem] sm:max-w-[9rem]"
      >
        {seasons.map((id) => (
          <option key={id} value={id}>
            {id.replace(/^s/i, "Season ")}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function SeasonSelect(props: SeasonSelectProps) {
  return (
    <Suspense
      fallback={
        <div className="h-11 sm:h-8 w-[8.5rem] sm:w-[7rem] rounded border border-ttl-border bg-ttl-slate/50 animate-pulse shrink-0" />
      }
    >
      <SeasonSelectInner {...props} />
    </Suspense>
  );
}
