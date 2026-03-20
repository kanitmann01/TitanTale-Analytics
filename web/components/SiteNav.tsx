"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { SeasonId } from "@/lib/season-types";
import SeasonSelect from "@/components/SeasonSelect";

const links = [
  { href: "/", label: "Overview" },
  { href: "/players", label: "Players" },
  { href: "/civilizations", label: "Civilizations" },
  { href: "/maps", label: "Maps" },
  { href: "/matchups", label: "Matchups" },
  { href: "/analysis", label: "Analysis" },
  { href: "/research", label: "Research" },
];

interface SiteNavProps {
  seasons: SeasonId[];
  currentSeason: SeasonId;
}

export default function SiteNav({ seasons, currentSeason }: SiteNavProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelId = useId();

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu();
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [menuOpen, closeMenu]);

  return (
    <>
    <nav
      className="sticky top-0 z-40 border-b border-ttl-border-subtle bg-ttl-navy/85 backdrop-blur-lg transition-[border-color] duration-200 pt-[max(0px,env(safe-area-inset-top))]"
      aria-label="Primary"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between gap-3 py-2 md:py-1.5 md:min-h-12 w-full">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 md:flex-initial">
          <Link
            href="/"
            className="nav-brand font-display text-fluid-sm font-bold tracking-wider text-ttl-gold hover:text-ttl-gold-light min-h-11 md:min-h-0 inline-flex items-center py-1 shrink-0"
            onClick={closeMenu}
          >
            TTL Stats
          </Link>
          <SeasonSelect seasons={seasons} currentSeason={currentSeason} />
        </div>

        <div
          className="hidden md:flex items-center gap-0.5 flex-wrap justify-end shrink-0"
          aria-label="Site sections"
        >
          {links.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative shrink-0 inline-flex items-center px-2.5 lg:px-3 py-1.5 rounded text-fluid-xs whitespace-nowrap transition-[color,background-color] duration-200 ease-out ${
                  isActive
                    ? "text-ttl-gold"
                    : "text-muted hover:text-primary hover:bg-ttl-surface/40 active:bg-ttl-surface/50"
                }`}
              >
                {link.label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-2.5 right-2.5 lg:left-3 lg:right-3 h-[2px] rounded-full bg-gradient-to-r from-ttl-gold to-ttl-accent/80 origin-center transition-opacity duration-200"
                    aria-hidden
                  />
                )}
              </Link>
            );
          })}
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          className="md:hidden inline-flex h-11 w-11 shrink-0 items-center justify-center rounded border border-ttl-border-subtle bg-ttl-slate/90 text-primary hover:bg-ttl-surface/60 hover:border-ttl-accent/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-ttl-accent/45 transition-colors"
          aria-expanded={menuOpen}
          aria-controls={menuPanelId}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
          <span aria-hidden className="relative block h-4 w-5">
            <span
              className={`absolute left-0 right-0 h-0.5 rounded-full bg-current transition-transform duration-200 ease-out origin-center ${
                menuOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0.5"
              }`}
            />
            <span
              className={`absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-current transition-opacity duration-200 ${
                menuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 right-0 h-0.5 rounded-full bg-current transition-transform duration-200 ease-out origin-center ${
                menuOpen ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0.5"
              }`}
            />
          </span>
        </button>
      </div>
    </nav>

    {menuOpen ? (
      <div
        className="fixed inset-0 z-[60] md:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Main navigation"
        id={menuPanelId}
      >
        <button
          type="button"
          className="absolute inset-0 bg-ttl-navy/80 backdrop-blur-sm"
          aria-label="Close menu"
          onClick={closeMenu}
        />
        <div
          className="absolute right-0 top-0 bottom-0 flex w-[min(100%,20rem)] flex-col border-l border-ttl-border-subtle bg-ttl-raised shadow-[-8px_0_32px_rgba(0,0,0,0.35)] anim-slide-menu"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-ttl-border-subtle px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <span className="section-label-gold">Navigate</span>
            <button
              ref={closeButtonRef}
              type="button"
              className="inline-flex h-11 min-w-11 items-center justify-center rounded border border-ttl-border-subtle px-3 text-fluid-sm text-secondary hover:text-primary hover:bg-ttl-surface/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ttl-accent/45"
              aria-label="Close menu"
              onClick={() => {
                closeMenu();
                menuButtonRef.current?.focus();
              }}
            >
              Close
            </button>
          </div>
          <nav
            className="flex flex-1 flex-col gap-0.5 overflow-y-auto overscroll-y-contain px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
            aria-label="Site sections"
          >
            {links.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex min-h-12 items-center rounded-md px-3 text-fluid-base font-medium transition-colors ${
                    isActive
                      ? "bg-ttl-gold/10 text-ttl-gold border border-ttl-gold/25"
                      : "text-primary hover:bg-ttl-surface/50 border border-transparent"
                  }`}
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    ) : null}
    </>
  );
}
