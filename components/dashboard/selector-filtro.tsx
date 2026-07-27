"use client";

import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/**
 * Multi-selector genérico de chips/checkboxes en popover — usado por los
 * filtros de deporte y fase de /dashboard (mismo patrón visual que
 * `SelectorAtletas`/`SelectorGraficos`). Filtra QUÉ atletas componen el
 * "equipo" agregado de todos los gráficos de la página, no un dato propio.
 */
export function SelectorFiltro({
  label,
  icon: Icon,
  opciones,
  seleccionados,
  onChange,
}: {
  label: string;
  icon: LucideIcon;
  opciones: string[];
  seleccionados: string[];
  onChange: (next: string[]) => void;
}) {
  function toggle(opcion: string) {
    onChange(
      seleccionados.includes(opcion) ? seleccionados.filter((s) => s !== opcion) : [...seleccionados, opcion]
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-borderSoft bg-surface2 px-3 py-2 text-sm font-medium text-textStrong shadow-sm transition-colors hover:border-brand/50"
        >
          <Icon className="size-4 text-textDim" />
          {label}
          {seleccionados.length > 0 && (
            <span className="rounded-full bg-brand-tint px-1.5 py-0.5 text-[11px] font-semibold text-brand-ink">
              {seleccionados.length}
            </span>
          )}
          <ChevronDown className="size-3.5 text-textDim" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        {opciones.length === 0 ? (
          <p className="px-2 py-3 text-center text-sm text-textDim">Sin opciones disponibles.</p>
        ) : (
          <div className="max-h-64 space-y-0.5 overflow-y-auto">
            {opciones.map((o) => {
              const activo = seleccionados.includes(o);
              return (
                <label
                  key={o}
                  className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-bg"
                >
                  <input
                    type="checkbox"
                    checked={activo}
                    onChange={() => toggle(o)}
                    className="size-4 shrink-0 accent-brand"
                  />
                  <span className="truncate text-sm text-textStrong">{o}</span>
                </label>
              );
            })}
          </div>
        )}
        {seleccionados.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="mt-2 text-xs font-medium text-brand-ink hover:underline"
          >
            Limpiar selección
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}
