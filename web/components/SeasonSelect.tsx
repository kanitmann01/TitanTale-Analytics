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
    <label className="flex items-center gap-2 shrink-0 text-fluid-xs text-muted">
      <span className="sr-only">Season</span>
      <select
        value={currentSeason}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 rounded border border-ttl-border bg-ttl-slate px-2 text-primary focus:outline-none focus:ring-2 focus:ring-ttl-accent/30 max-w-[9rem]"
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
        <div className="h-8 w-[7rem] rounded border border-ttl-border bg-ttl-slate/50 animate-pulse shrink-0" />
      }
    >
      <SeasonSelectInner {...props} />
    </Suspense>
  );
}
