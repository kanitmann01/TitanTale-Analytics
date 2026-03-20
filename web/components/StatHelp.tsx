"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";

type Align = "start" | "end";

export default function StatHelp({
  text,
  ariaLabel,
  align = "start",
}: {
  text: string;
  /** Accessible name for the help button, e.g. "Help: Win rate" */
  ariaLabel: string;
  /** Align the tooltip relative to the trigger (use end near viewport edge). */
  align?: Align;
}) {
  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="text-fluid-xs text-ttl-accent hover:text-ttl-gold w-5 h-5 rounded-full border border-ttl-border-subtle outline-none focus-visible:ring-2 focus-visible:ring-ttl-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-ttl-raised"
          aria-label={ariaLabel}
        >
          ?
        </button>
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent
          side="bottom"
          align={align === "end" ? "end" : "start"}
          sideOffset={6}
          collisionPadding={12}
          className="z-[11000] w-56 max-w-[min(100vw-2rem,14rem)] rounded border border-ttl-border bg-ttl-surface px-2.5 py-2 text-fluid-xs leading-snug text-secondary shadow-lg"
        >
          {text}
        </TooltipContent>
      </TooltipPortal>
    </Tooltip>
  );
}
