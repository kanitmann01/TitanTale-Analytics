"use client";

import { Suspense, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function ComparePickersInner({
  allPlayers,
  nameA,
  nameB,
}: {
  allPlayers: string[];
  nameA: string;
  nameB: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const push = useCallback(
    (nextA: string, nextB: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("a", nextA);
      params.set("b", nextB);
      router.push(`${pathname}?${params.toString()}`);
      router.refresh();
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-5 md:gap-4 mb-10">
      <label className="flex flex-col gap-1.5 text-fluid-sm md:text-fluid-xs text-muted w-full md:min-w-[12rem] md:w-auto">
        First player
        <select
          value={nameA}
          onChange={(e) => push(e.target.value, nameB)}
          className="select-interactive w-full min-h-11 md:min-h-10 h-11 md:h-10 rounded border border-ttl-border bg-ttl-slate px-3 md:px-2 text-fluid-sm text-primary focus:outline-none focus:ring-2 focus:ring-ttl-accent/40 focus:border-ttl-accent/50"
        >
          {allPlayers.map((p) => (
            <option key={`a-${p}`} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
      <span className="text-fluid-base md:text-fluid-lg text-muted font-display font-bold self-center text-center py-1 md:py-0 -my-1 md:my-0">
        vs
      </span>
      <label className="flex flex-col gap-1.5 text-fluid-sm md:text-fluid-xs text-muted w-full md:min-w-[12rem] md:w-auto">
        Second player
        <select
          value={nameB}
          onChange={(e) => push(nameA, e.target.value)}
          className="select-interactive w-full min-h-11 md:min-h-10 h-11 md:h-10 rounded border border-ttl-border bg-ttl-slate px-3 md:px-2 text-fluid-sm text-primary focus:outline-none focus:ring-2 focus:ring-ttl-accent/40 focus:border-ttl-accent/50"
        >
          {allPlayers.map((p) => (
            <option key={`b-${p}`} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export default function ComparePickers(props: {
  allPlayers: string[];
  nameA: string;
  nameB: string;
}) {
  return (
    <Suspense
      fallback={<div className="h-24 mb-10 rounded bg-ttl-slate/40 animate-pulse" />}
    >
      <ComparePickersInner {...props} />
    </Suspense>
  );
}
