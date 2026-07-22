"use client";

import { cn } from "@/lib/utils";
import { RANGOS_SEMANAS, type RangoSemanas } from "@/lib/dashboard/metricas";

export function SelectorRango({
  valor,
  onChange,
}: {
  valor: RangoSemanas;
  onChange: (v: RangoSemanas) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-borderSoft bg-bg p-0.5">
      {RANGOS_SEMANAS.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            valor === r ? "bg-surface2 text-brand-ink shadow-sm" : "text-textDim hover:text-textStrong"
          )}
        >
          {r} sem.
        </button>
      ))}
    </div>
  );
}
