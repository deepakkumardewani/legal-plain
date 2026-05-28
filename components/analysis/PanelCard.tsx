import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PanelCardProps {
  title: string;
  subtitle?: ReactNode;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  children: ReactNode;
}

export function PanelCard({
  title,
  subtitle,
  className,
  titleClassName,
  subtitleClassName,
  children,
}: PanelCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border p-6 shadow-[0_20px_70px_-58px_rgba(74,55,31,0.65)] md:p-7",
        className,
      )}
    >
      <h2
        className={cn("text-lg font-semibold", titleClassName)}
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h2>
      {subtitle && <p className={cn("mt-1 text-sm", subtitleClassName)}>{subtitle}</p>}
      {children}
    </section>
  );
}
