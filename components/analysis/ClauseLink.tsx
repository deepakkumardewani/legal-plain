import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ClauseLinkProps {
  onClick: () => void;
  className?: string;
  children: ReactNode;
}

export function ClauseLink({ onClick, className, children }: ClauseLinkProps) {
  return (
    <button
      type="button"
      className={cn(
        "text-sm font-medium underline transition-colors focus-visible:outline-none focus-visible:ring-2",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
