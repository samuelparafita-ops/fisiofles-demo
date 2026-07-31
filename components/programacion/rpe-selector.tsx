"use client";

import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChipIntensidad } from "@/components/programacion/intensidad-chip";

/** Tabla RPE ↔ sensación del sistema real del cliente (contenido estático). */
const RPE_REFERENCIA: { rpe: number; sensacion: string }[] = [
  { rpe: 6, sensacion: "Movimiento cómodo, sin pérdida de velocidad" },
  { rpe: 6.5, sensacion: "Última repetición algo más lenta" },
  { rpe: 7, sensacion: "Últimas repes claramente más lentas" },
  { rpe: 7.5, sensacion: "Últimas 2-3 repes costosas" },
  { rpe: 8, sensacion: "Pérdida de velocidad desde media serie" },
  { rpe: 8.5, sensacion: "Más de la mitad de repes lentas" },
  { rpe: 9, sensacion: "Muy lento al final" },
  { rpe: 9.5, sensacion: "Casi todas las repes al límite" },
  { rpe: 10, sensacion: "Fallo o deterioro técnico" },
];

function RpeReferenciaPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Ver referencia RPE"
          className="rounded-full p-0.5 text-textDim transition-colors hover:text-brand-ink"
        >
          <Info className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <p className="mb-2 text-xs font-semibold text-textStrong">Referencia RPE ↔ sensación</p>
        <div className="space-y-1">
          {RPE_REFERENCIA.map((r) => (
            <div key={r.rpe} className="flex gap-2 text-xs">
              <span className="w-8 shrink-0 font-semibold text-textStrong">{r.rpe}</span>
              <span className="text-textDim">{r.sensacion}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Selector de RPE objetivo (0-10, paso 0.5) + chip de intensidad CALCULADA
 * (se actualiza al instante, ver `intensidadSesion`) + popover de referencia
 * RPE↔sensación. Componente compartido por `SesionDetalleDialog` y
 * `NuevaSesionDialog` (editor de sesión, FASE 5).
 */
export function RpeSelector({
  id,
  value,
  onChange,
}: {
  id: string;
  value: number;
  onChange: (rpe: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label htmlFor={id} className="text-sm font-medium text-textStrong">
          RPE objetivo
        </label>
        <RpeReferenciaPopover />
      </div>
      <div className="flex items-center gap-3">
        <input
          id={id}
          type="range"
          min={0}
          max={10}
          step={0.5}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-2 flex-1 cursor-pointer accent-brand"
        />
        <span className="w-8 shrink-0 text-right font-display text-sm font-bold text-textStrong">{value}</span>
        <ChipIntensidad rpe={value} />
      </div>
    </div>
  );
}
