import Link from "next/link";
import type { SeasonId } from "@/lib/season-types";
import { getTournamentInfo } from "@/lib/data/tournament";
import { getCoreDataLastModifiedMs } from "@/lib/data/paths";

interface SiteFooterProps {
  seasonId: SeasonId;
}

export default function SiteFooter({ seasonId }: SiteFooterProps) {
  const tournament = getTournamentInfo(seasonId);
  const mtime = getCoreDataLastModifiedMs(seasonId);
  const updated =
    mtime > 0
      ? new Date(mtime).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ttl-border-subtle mt-auto pb-[max(0px,env(safe-area-inset-bottom))]">
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-10 pb-6 md:pb-10 flex flex-col gap-6 text-fluid-xs text-muted">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-start sm:items-center sm:justify-between gap-4">
          <p>
            Data sourced from Liquipedia and tournament records.
            {updated && (
              <>
                {" "}
                Last updated: <span className="text-secondary">{updated}</span>.
              </>
            )}
          </p>
          <nav
            className="flex flex-wrap gap-x-1 gap-y-1 sm:gap-x-4 sm:gap-y-2"
            aria-label="Footer"
          >
            <Link
              href="/"
              className="footer-link text-ttl-accent hover:text-ttl-gold inline-flex items-center min-h-11 px-2 -mx-2 sm:min-h-0 sm:px-0 sm:mx-0 rounded sm:rounded-none"
            >
              Overview
            </Link>
            <Link
              href="/players"
              className="footer-link text-ttl-accent hover:text-ttl-gold inline-flex items-center min-h-11 px-2 -mx-2 sm:min-h-0 sm:px-0 sm:mx-0 rounded sm:rounded-none"
            >
              Players
            </Link>
            <Link
              href="/civilizations"
              className="footer-link text-ttl-accent hover:text-ttl-gold inline-flex items-center min-h-11 px-2 -mx-2 sm:min-h-0 sm:px-0 sm:mx-0 rounded sm:rounded-none"
            >
              Civilizations
            </Link>
            <Link
              href="/maps"
              className="footer-link text-ttl-accent hover:text-ttl-gold inline-flex items-center min-h-11 px-2 -mx-2 sm:min-h-0 sm:px-0 sm:mx-0 rounded sm:rounded-none"
            >
              Maps
            </Link>
            {tournament.links.liquipedia && (
              <a
                href={tournament.links.liquipedia}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link text-ttl-accent hover:text-ttl-gold inline-flex items-center min-h-11 px-2 -mx-2 sm:min-h-0 sm:px-0 sm:mx-0 rounded sm:rounded-none"
              >
                Liquipedia
              </a>
            )}
            {tournament.links.youtube && (
              <a
                href={tournament.links.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link text-ttl-accent hover:text-ttl-gold inline-flex items-center min-h-11 px-2 -mx-2 sm:min-h-0 sm:px-0 sm:mx-0 rounded sm:rounded-none"
              >
                YouTube
              </a>
            )}
          </nav>
        </div>
        <p className="text-fluid-xs text-muted/80">
          &copy; {year} TTL Stats. Not affiliated with Microsoft, Forgotten
          Empires, or T90. Age of Empires II is a trademark of Microsoft
          Corporation.
        </p>
      </div>
    </footer>
  );
}
