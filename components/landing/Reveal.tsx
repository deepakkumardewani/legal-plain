"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

const ROOT_MARGIN = "0px 0px -12% 0px";
const THRESHOLD = 0.15;

type RevealProps = {
  children: ReactNode;
  /** Delay before the reveal starts, in seconds — used to stagger sibling reveals. */
  delay?: number;
  /** Render element. Defaults to a div so it can wrap any section. */
  as?: ElementType;
  className?: string;
};

/**
 * Wraps content in a one-time fade-and-rise that triggers when it scrolls into view.
 * Restraint by design: small distance, ease-out, fires once, and respects
 * prefers-reduced-motion via the .lp-reveal CSS in globals.css.
 */
export function Reveal({ children, delay = 0, as, className }: RevealProps) {
  const Tag = as ?? "div";
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { rootMargin: ROOT_MARGIN, threshold: THRESHOLD },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <Tag
      ref={ref}
      className={`lp-reveal${isVisible ? " is-visible" : ""}${className ? ` ${className}` : ""}`}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </Tag>
  );
}
