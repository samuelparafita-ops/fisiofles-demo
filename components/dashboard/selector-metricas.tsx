"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { METRICAS_DASHBOARD } from "@/lib/dashboard/metricas";
import { useConfig, useDispatch } from "@/lib/store";

/**
 * Checkboxes de métricas visibles en /dashboard — persiste en
 * `config.dashboardMetricas` (sobrevive al refresh). El orden de render lo
 * decide `config.dashboardOrden` en la propia página, no este selector.
 */
export function SelectorMetricas() {
  const { dashboardMetricas } = useConfig();
  const dispatch = useDispatch();

  function toggle(id: string) {
    const next = dashboardMetricas.includes(id)
      ? dashboardMetricas.filter((m) => m !== id)
      : [...dashboardMetricas, id];
    dispatch({ type: "CONFIG_ACTUALIZAR", payload: { dashboardMetricas: next } });
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-borderSoft bg-surface2 px-3 py-2 text-sm font-medium text-textStrong shadow-sm transition-colors hover:border-brand/50"
        >
          <SlidersHorizontal className="size-4 text-textDim" />
          Métricas
          <span className="rounded-full bg-brand-tint px-1.5 py-0.5 text-[11px] font-semibold text-brand-ink">
            {dashboardMetricas.length}/{METRICAS_DASHBOARD.length}
          </span>
          <ChevronDown className="size-3.5 text-textDim" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-textDim">Métricas visibles</p>
        <div className="space-y-0.5">
          {METRICAS_DASHBOARD.map((m) => {
            const activo = dashboardMetricas.includes(m.id);
            return (
              <label
                key={m.id}
                className="flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-2 transition-colors hover:bg-bg"
              >
                <input
                  type="checkbox"
                  checked={activo}
                  onChange={() => toggle(m.id)}
                  className="mt-0.5 size-4 shrink-0 accent-brand"
                />
                <span>
                  <span className="block text-sm font-medium text-textStrong">{m.label}</span>
                  <span className="block text-xs text-textDim">{m.descripcion}</span>
                </span>
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
