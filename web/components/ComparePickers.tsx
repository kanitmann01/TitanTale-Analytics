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
    <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-4 mb-10">
      <label className="flex flex-col gap-1 text-fluid-xs text-muted min-w-[12rem]">
        Player A
        <select
          value={nameA}
          onChange={(e) => push(e.target.value, nameB)}
          className="h-10 rounded border border-ttl-border bg-ttl-slate px-2 text-primary"
        >
          {allPlayers.map((p) => (
            <option key={`a-${p}`} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
      <span className="text-fluid-lg text-muted font-display font-bold self-center hidden md:block">
        vs
      </span>
      <label className="flex flex-col gap-1 text-fluid-xs text-muted min-w-[12rem]">
        Player B
        <select
          value={nameB}
          onChange={(e) => push(nameA, e.target.value)}
          className="h-10 rounded border border-ttl-border bg-ttl-slate px-2 text-primary"
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
