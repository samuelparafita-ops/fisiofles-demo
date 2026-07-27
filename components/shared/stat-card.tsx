"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStateColors } from "@/lib/theme";

interface StatCardVariation {
  label: string;
  tone: "good" | "bad" | "neutral";
  direction?: "up" | "down";
}

interface StatCardProps {
  label: string;
  value: ReactNode;
  unit?: string;
  variation?: StatCardVariation;
  className?: string;
}

export function StatCard({
  label,
  value,
  unit,
  variation,
  className,
}: StatCardProps) {
  const estado = useStateColors();
  const toneColor: Record<StatCardVariation["tone"], string | undefined> = {
    good: estado.good,
    bad: estado.bad,
    neutral: undefined,
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-borderSoft bg-surface2 p-5 shadow-sm",
        className
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-display text-4xl font-bold tracking-tight text-textStrong md:text-5xl">
          {value}
        </span>
        {unit && (
          <span className="text-sm text-muted-foreground">{unit}</span>
        )}
      </div>
      {variation && (
        <div
          className={cn(
            "mt-2 flex items-center gap-1 text-xs font-medium",
            variation.tone === "neutral" && "text-muted-foreground"
          )}
          style={{ color: toneColor[variation.tone] }}
        >
          {variation.direction === "up" && <ArrowUp className="size-3" />}
          {variation.direction === "down" && <ArrowDown className="size-3" />}
          <span>{variation.label}</span>
        </div>
      )}
    </div>
  );
}
