import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Envoltorio compartido de los 4 gráficos: card clara (surface2, como el
 * resto de la app) con un panel de cockpit oscuro dentro (chartBg), que es
 * la única superficie donde viven los colores puros `data.*` — ver
 * CLAUDE.md > Estética.
 */
export function ChartPanel({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-borderSoft bg-surface2 p-5 shadow-sm",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-bold text-textStrong">
            {title}
          </h3>
          {description && (
            <p className="mt-0.5 text-xs text-textDim">{description}</p>
          )}
        </div>
        {action}
      </div>
      <div className="mt-4 rounded-lg border border-chartGrid bg-chartBg p-4">
        {children}
      </div>
    </div>
  );
}

/** Chip de leyenda manual (Recharts <Legend> no encaja con el estilo HUD). */
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
    <span className="flex items-center gap-1.5 text-xs text-chartText">
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

/** Caja de tooltip oscura compartida entre los 4 gráficos. */
export function ChartTooltipBox({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-chartGrid bg-[#0F1215] px-3 py-2 text-xs shadow-lg">
      {children}
    </div>
  );
}
