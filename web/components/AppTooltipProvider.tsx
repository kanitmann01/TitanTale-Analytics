"use client";

import { TooltipProvider } from "@radix-ui/react-tooltip";

export default function AppTooltipProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider delayDuration={200} skipDelayDuration={250}>
      {children}
    </TooltipProvider>
  );
}
