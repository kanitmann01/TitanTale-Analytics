"use client";

import {
  spiritDocketRoman,
  type FindingVerdict,
} from "@/components/research/ResearchFindingsExplorer";

export interface MythVsRecordItem {
  findingId: number;
  mythHeadline: string;
  verdict: FindingVerdict;
  verdictLine: string;
}

const VERDICT_BADGE: Record<FindingVerdict, string> = {
  CONFIRMED: "border-ttl-win/35 text-ttl-win bg-ttl-win/10",
  BUSTED: "border-ttl-loss/35 text-ttl-loss bg-ttl-loss/10",
  INCONCLUSIVE: "border-ttl-accent/35 text-ttl-accent bg-ttl-accent/10",
};

export default function MythVsRecord({ items }: { items: MythVsRecordItem[] }) {
  if (items.length === 0) return null;

  function goToFinding(id: number): void {
    window.location.hash = `spirit-finding-${id}`;
    requestAnimationFrame(() => {
      document
        .getElementById(`spirit-finding-${id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <section className="mb-14 anim-fade-up border-l-[3px] border-ttl-gold/30 pl-5 sm:pl-7 py-1">
      <h2 className="section-label mb-2">Myth vs record</h2>
      <p className="text-fluid-xs text-muted mb-6 max-w-2xl leading-relaxed">
        Popular claims checked against the numbers. Open a card to jump to the
        full investigation.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {items.map((item) => (
          <button
            key={item.findingId}
            type="button"
            onClick={() => goToFinding(item.findingId)}
            className="btn-press text-left rounded-md border border-ttl-border-subtle/80 bg-ttl-raised/30 p-4 transition-[border-color,background-color,transform] duration-200 ease-out hover:border-ttl-gold/28 hover:bg-ttl-raised/50 motion-safe:hover:-translate-y-px"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-fluid-xs font-display text-ttl-gold/90 tracking-widest">
                Docket {spiritDocketRoman(item.findingId)}
              </span>
              <span
                className={`text-fluid-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${VERDICT_BADGE[item.verdict]}`}
              >
                {item.verdict}
              </span>
            </div>
            <p className="text-fluid-sm text-primary font-medium leading-snug mb-2">
              &ldquo;{item.mythHeadline}&rdquo;
            </p>
            <p className="text-fluid-xs text-secondary leading-relaxed">
              Record: {item.verdictLine}
            </p>
            <p className="text-fluid-xs text-ttl-accent mt-3 font-medium">
              Open investigation &rarr;
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
