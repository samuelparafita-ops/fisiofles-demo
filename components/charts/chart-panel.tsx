"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Envoltorio compartido de los gráficos — card elevada sobre `surface2` con
 * la sombra de elevación del sistema (`shadow-card`) y borde hairline. El
 * tema "Oscuro" la retiñe solo (surface2/borde/sombra son CSS vars). El
 * modo cockpit del retirado tema "clasico-excel" desapareció en el rediseño
 * 2026-07.
 */
export function ChartPanel({
  title,
  description,
  action,
  metric,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  /** Número resumen grande a la derecha de la cabecera — el dato protagonista. */
  metric?: { value: ReactNode; label?: string };
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-borderSoft bg-surface2 p-6 shadow-card",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-base font-semibold text-textStrong">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-textDim">{description}</p>}
        </div>
        <div className="flex flex-wrap items-start gap-4">
          {action}
          {metric && (
            <div className="text-right">
              <p className="font-display text-4xl font-bold leading-none tracking-tight text-textStrong md:text-5xl">
                {metric.value}
              </p>
              {metric.label && <p className="mt-1.5 text-[11px] text-textDim">{metric.label}</p>}
            </div>
          )}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

/** Chip de leyenda manual (Recharts <Legend> no encaja con el layout de los gráficos). */
export function LegendChip({
  color,
  label,
  dashed = false,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-textDim">
      <span
        className="inline-block h-0.5 w-3"
        style={{
          background: dashed ? "transparent" : color,
          borderTop: dashed ? `2px dashed ${color}` : undefined,
        }}
      />
      {label}
    </span>
  );
}

/** Caja de tooltip compartida entre los gráficos. */
export function ChartTooltipBox({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-borderSoft bg-surface2 px-3 py-2 text-xs shadow-pop">
      {children}
    </div>
  );
}
