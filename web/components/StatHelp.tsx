"use client";

import { useId, useState } from "react";

export default function StatHelp({ text }: { text: string }) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <span className="inline-flex items-center relative ml-1">
      <button
        type="button"
        className="text-fluid-xs text-ttl-accent hover:text-ttl-gold w-5 h-5 rounded-full border border-ttl-border-subtle"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        title="Explain"
      >
        ?
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute z-50 left-0 top-full mt-1 w-56 rounded border border-ttl-border bg-ttl-surface p-2 text-fluid-xs text-secondary shadow-lg"
        >
          {text}
        </span>
      )}
    </span>
  );
}
