"use client";

import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type OpcionFiltro = {
  value: string;
  label: string;
  /** Punto de color junto a la opción (ej. semáforo de fase) — opcional. */
  color?: string;
};

/**
 * Multi-selector genérico de chips/checkboxes en popover — usado por los
 * filtros de deporte, lesión y fase de /dashboard (mismo patrón visual que
 * `SelectorAtletas`/`SelectorGraficos`). Filtra QUÉ atletas componen el
 * "equipo" agregado de todos los gráficos de la página, no un dato propio.
 * Soporta un estado deshabilitado con hint accesible (siempre visible, no solo
 * al pasar el ratón) — lo usa el filtro "Fase", activo solo con una única
 * lesión seleccionada.
 */
export function SelectorFiltro({
  label,
  icon: Icon,
  opciones,
  seleccionados,
  onChange,
  disabled = false,
  disabledHint,
}: {
  label: string;
  icon: LucideIcon;
  opciones: OpcionFiltro[];
  seleccionados: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  disabledHint?: string;
}) {
  function toggle(value: string) {
    onChange(
      seleccionados.includes(value) ? seleccionados.filter((s) => s !== value) : [...seleccionados, value]
    );
  }

  const boton = (
    <button
      type="button"
      disabled={disabled}
      aria-disabled={disabled}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-borderSoft bg-surface2 px-3 py-2 text-sm font-medium text-textStrong shadow-sm transition-colors",
        disabled ? "cursor-not-allowed opacity-50" : "hover:border-brand/50"
      )}
    >
      <Icon className="size-4 text-textDim" />
      {label}
      {!disabled && seleccionados.length > 0 && (
        <span className="rounded-full bg-brand-tint px-1.5 py-0.5 text-[11px] font-semibold text-brand-ink">
          {seleccionados.length}
        </span>
      )}
      <ChevronDown className="size-3.5 text-textDim" />
    </button>
  );

  return (
    <div className="flex items-center gap-2">
      {disabled ? (
        boton
      ) : (
        <Popover>
          <PopoverTrigger asChild>{boton}</PopoverTrigger>
          <PopoverContent className="w-64">
            {opciones.length === 0 ? (
              <p className="px-2 py-3 text-center text-sm text-textDim">Sin opciones disponibles.</p>
            ) : (
              <div className="max-h-64 space-y-0.5 overflow-y-auto">
                {opciones.map((o) => {
                  const activo = seleccionados.includes(o.value);
                  return (
                    <label
                      key={o.value}
                      className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-bg"
                    >
                      <input
                        type="checkbox"
                        checked={activo}
                        onChange={() => toggle(o.value)}
                        className="size-4 shrink-0 accent-brand"
                      />
                      {o.color && (
                        <span className="size-2 shrink-0 rounded-full" style={{ background: o.color }} aria-hidden />
                      )}
                      <span className="truncate text-sm text-textStrong">{o.label}</span>
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
      )}
      {disabled && disabledHint && <span className="text-xs text-textDim">{disabledHint}</span>}
    </div>
  );
}
