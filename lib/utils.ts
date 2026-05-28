import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Numeric suffix from ids like `clause-16`; falls back to list index + 1. */
export function clauseNumber(id: string, fallbackIndex = 0): number {
  const match = id.match(/-(\d+)$/);
  if (match) return Number(match[1]);
  return fallbackIndex + 1;
}
