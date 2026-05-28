"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ClauseAnalysis, RiskLevel } from "@/lib/types";

const FLASH_DURATION_MS = 1600;

export const CLAUSE_CATEGORY_TABS_ID = "clause-category-tabs";

function scrollToClauseCategoryTabs(): void {
  const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
  document.getElementById(CLAUSE_CATEGORY_TABS_ID)?.scrollIntoView({
    behavior,
    block: "start",
  });
}

interface ClauseNavigationContextValue {
  activeTab: RiskLevel;
  setActiveTab: (level: RiskLevel) => void;
  flashId: string | null;
  idToClause: Map<string, ClauseAnalysis>;
  goToClause: (id: string) => void;
  goToTab: (level: RiskLevel) => void;
}

const ClauseNavigationContext = createContext<ClauseNavigationContextValue | null>(null);

export function useClauseNav(): ClauseNavigationContextValue {
  const ctx = useContext(ClauseNavigationContext);
  if (!ctx) {
    throw new Error("useClauseNav must be used within ClauseNavigationProvider");
  }
  return ctx;
}

interface ClauseNavigationProviderProps {
  clauses: ClauseAnalysis[];
  children: ReactNode;
}

export function ClauseNavigationProvider({ clauses, children }: ClauseNavigationProviderProps) {
  const [activeTab, setActiveTab] = useState<RiskLevel>("RED");
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const idToClause = useMemo(() => {
    const map = new Map<string, ClauseAnalysis>();
    for (const clause of clauses) {
      map.set(clause.id, clause);
    }
    return map;
  }, [clauses]);

  const idToLevel = useMemo(() => {
    const map = new Map<string, RiskLevel>();
    for (const clause of clauses) {
      map.set(clause.id, clause.riskLevel);
    }
    return map;
  }, [clauses]);

  const clearFlashTimeout = useCallback(() => {
    if (flashTimeoutRef.current) {
      clearTimeout(flashTimeoutRef.current);
      flashTimeoutRef.current = null;
    }
  }, []);

  const scheduleFlashClear = useCallback(() => {
    clearFlashTimeout();
    flashTimeoutRef.current = setTimeout(() => {
      setFlashId(null);
      flashTimeoutRef.current = null;
    }, FLASH_DURATION_MS);
  }, [clearFlashTimeout]);

  const goToClause = useCallback(
    (id: string) => {
      const level = idToLevel.get(id);
      if (!level) return;
      clearFlashTimeout();
      setFlashId(null);
      setActiveTab(level);
      setPendingScrollId(id);
    },
    [idToLevel, clearFlashTimeout],
  );

  const goToTab = useCallback(
    (level: RiskLevel) => {
      setPendingScrollId(null);
      clearFlashTimeout();
      setFlashId(null);
      setActiveTab(level);
      requestAnimationFrame(() => {
        requestAnimationFrame(scrollToClauseCategoryTabs);
      });
    },
    [clearFlashTimeout],
  );

  useEffect(() => {
    if (!pendingScrollId) return;

    const targetId = pendingScrollId;

    const scrollAndFlash = (): boolean => {
      const el = document.getElementById(`clause-${targetId}`);
      if (!el) return false;

      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setFlashId(targetId);
      setPendingScrollId(null);
      scheduleFlashClear();
      return true;
    };

    if (scrollAndFlash()) return;

    const retryId = window.setTimeout(() => {
      scrollAndFlash();
    }, 0);

    return () => clearTimeout(retryId);
  }, [activeTab, pendingScrollId, scheduleFlashClear]);

  useEffect(() => () => clearFlashTimeout(), [clearFlashTimeout]);

  const value = useMemo(
    () => ({
      activeTab,
      setActiveTab,
      flashId,
      idToClause,
      goToClause,
      goToTab,
    }),
    [activeTab, flashId, idToClause, goToClause, goToTab],
  );

  return (
    <ClauseNavigationContext.Provider value={value}>{children}</ClauseNavigationContext.Provider>
  );
}
