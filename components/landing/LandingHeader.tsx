"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const NAV_ITEMS = [
  { id: "documents", label: "Documents" },
  { id: "method", label: "Method" },
  { id: "features", label: "Features" },
  { id: "privacy", label: "Privacy" },
  { id: "faq", label: "FAQ" },
] as const;

const SCROLL_THRESHOLD = 8;

/** Top offset (px) matching the sticky header so a section counts as active once it clears it. */
const SPY_TOP_MARGIN = 80;

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: `-${SPY_TOP_MARGIN}px 0px -55% 0px`, threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 px-5 py-3 transition-colors duration-300 md:px-8 ${
        scrolled
          ? "border-b border-outline-warm bg-background/90 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
        <a href="#" className="group flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="LexLight Logo"
            width={32}
            height={32}
            className="rounded-full transition-transform duration-200 group-hover:-rotate-6"
          />
          <span
            className={`text-lg font-semibold tracking-tight transition-colors duration-300 ${
              scrolled ? "text-foreground" : "text-white"
            }`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            LexLight
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Landing page sections">
          {NAV_ITEMS.map((item) => {
            const isActive = activeId === item.id;
            const stateClass = scrolled
              ? isActive
                ? "bg-surface-warm text-foreground"
                : "text-on-surface-variant hover:bg-surface-warm hover:text-foreground"
              : isActive
                ? "bg-white/15 text-white"
                : "text-white/80 hover:bg-white/10 hover:text-white";

            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={isActive ? "true" : undefined}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${stateClass}`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/analyze"
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-accent/90 hover:shadow-[0_4px_16px_-4px_rgba(200,121,26,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Analyze my document
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:hidden ${
              scrolled
                ? "text-on-surface-variant hover:bg-surface-warm"
                : "text-white/90 hover:bg-white/10"
            }`}
          >
            <span className="relative block h-4 w-5">
              <span
                className={`absolute left-0 block h-0.5 w-full bg-current transition-all duration-200 ${
                  menuOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1/2 block h-0.5 w-full -translate-y-1/2 bg-current transition-opacity duration-200 ${
                  menuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 block h-0.5 w-full bg-current transition-all duration-200 ${
                  menuOpen ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Landing page sections"
          className="lp-menu-in absolute right-5 top-full mt-2 w-44 overflow-hidden rounded-2xl border border-outline-warm bg-background/95 p-2 shadow-lg backdrop-blur-xl md:hidden"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setMenuOpen(false)}
              aria-current={activeId === item.id ? "true" : undefined}
              className={`block rounded-xl px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                activeId === item.id
                  ? "bg-surface-warm text-foreground"
                  : "text-on-surface-variant hover:bg-surface-warm hover:text-foreground"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
