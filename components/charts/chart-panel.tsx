"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useCockpit } from "@/lib/theme";

/**
 * Envoltorio compartido de los gráficos — dos modos:
 * - Claro (temas "fisiofles"/"oscuro"): un único contenedor sobre `surface2`,
 *   sin panel interior oscuro — ver CLAUDE.md > Estética. "Oscuro" lo
 *   retiñe solo (surface2 es CSS var), no hace falta lógica aquí.
 * - Cockpit (tema "clasico-excel"): panel oscuro `chartBg`, homenaje al
 *   Excel original — ver `useCockpit()` (lib/theme.ts) y Personalización >
 *   Apariencia. Los textos internos que usan `text-textStrong`/`text-textDim`
 *   (tooltips de cada gráfico) se sobrescriben vía selector en
 *   `ChartTooltipBox` para no tocar los 6 componentes de gráfico.
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
  const cockpit = useCockpit();

  return (
    <div
      className={cn(
        "rounded-xl border p-6 shadow-sm",
        cockpit ? "border-chartGrid bg-chartBg" : "border-borderSoft bg-surface2",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3
            className={cn(
              "font-display text-base font-bold",
              cockpit ? "text-white" : "text-textStrong"
            )}
          >
            {title}
          </h3>
          {description && (
            <p className={cn("mt-0.5 text-xs", cockpit ? "text-chartText" : "text-textDim")}>
              {description}
            </p>
          )}
        </div>
        <div className="flex items-start gap-4">
          {action}
          {metric && (
            <div className="text-right">
              <p
                className={cn(
                  "font-display text-4xl font-bold leading-none tracking-tight md:text-5xl",
                  cockpit ? "text-white" : "text-textStrong"
                )}
              >
                {metric.value}
              </p>
              {metric.label && (
                <p className={cn("mt-1.5 text-[11px]", cockpit ? "text-chartText" : "text-textDim")}>
                  {metric.label}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

/** Chip de leyenda manual (Recharts <Legend> no encaja con el layout de los 4 gráficos). */
export function LegendChip({
  color,
  label,
  dashed = false,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  const cockpit = useCockpit();
  return (
    <span className={cn("flex items-center gap-1.5 text-xs", cockpit ? "text-chartText" : "text-textDim")}>
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

/**
 * Caja de tooltip compartida entre los 6 gráficos. En cockpit, los textos
 * internos de cada tooltip (`text-textStrong`/`text-textDim`, pensados para
 * fondo claro) se fuerzan vía selector de descendiente — así los 6
 * componentes de gráfico no necesitan conocer el tema.
 */
export function ChartTooltipBox({ children }: { children: ReactNode }) {
  const cockpit = useCockpit();
  return (
    <div
      className={cn(
        "rounded-md border px-3 py-2 text-xs shadow-lg",
        cockpit
          ? "border-chartGrid bg-chartBg text-chartText [&_.text-textStrong]:!text-white [&_.text-textDim]:!text-chartText"
          : "border-borderSoft bg-surface2"
      )}
    >
      {children}
    </div>
  );
}
