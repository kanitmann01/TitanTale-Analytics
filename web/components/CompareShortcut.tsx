"use client";

import { useState } from "react";
import Link from "next/link";

export default function CompareShortcut({
  selfName,
  opponents,
}: {
  selfName: string;
  opponents: string[];
}) {
  const [other, setOther] = useState(opponents[0] ?? "");

  if (!other) {
    return null;
  }

  const href = `/compare?a=${encodeURIComponent(selfName)}&b=${encodeURIComponent(other)}`;

  return (
    <div className="flex flex-wrap items-center gap-3 mt-6">
      <span className="text-fluid-xs text-muted uppercase tracking-wider">
        Compare vs
      </span>
      <select
        value={other}
        onChange={(e) => setOther(e.target.value)}
        className="h-9 rounded border border-ttl-border bg-ttl-slate px-2 text-fluid-sm text-primary max-w-[14rem]"
      >
        {opponents.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <Link
        href={href}
        className="text-fluid-xs text-ttl-accent hover:text-ttl-gold transition-colors font-medium"
      >
        Open comparison
      </Link>
    </div>
  );
}
