"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { RANGOS_SEMANAS, RANGO_SEMANAS_DEFECTO, type RangoSemanas } from "@/lib/dashboard/series-tests";

export type RangoDashboardValor =
  | { tipo: "preset"; semanas: RangoSemanas }
  | { tipo: "personalizado"; desde: string; hasta: string };

export const RANGO_DASHBOARD_DEFECTO: RangoDashboardValor = { tipo: "preset", semanas: RANGO_SEMANAS_DEFECTO };

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function isoHaceDias(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Presets 4/8/12 semanas + "Personalizado" con dos `<input type="date">` en
 * popover (sin dependencias nuevas — suficiente para la demo, ver brief
 * FASE 4). El estado vive en la página como `RangoDashboardValor`; este
 * componente solo mantiene los valores de los inputs mientras el usuario
 * edita el rango personalizado.
 */
export function SelectorRango({
  valor,
  onChange,
}: {
  valor: RangoDashboardValor;
  onChange: (v: RangoDashboardValor) => void;
}) {
  const esPersonalizado = valor.tipo === "personalizado";
  const [desde, setDesde] = useState(esPersonalizado ? valor.desde : isoHaceDias(7 * (RANGO_SEMANAS_DEFECTO - 1)));
  const [hasta, setHasta] = useState(esPersonalizado ? valor.hasta : isoHaceDias(0));

  function aplicar(nextDesde: string, nextHasta: string) {
    setDesde(nextDesde);
    setHasta(nextHasta);
    if (nextDesde && nextHasta && nextDesde <= nextHasta) {
      onChange({ tipo: "personalizado", desde: nextDesde, hasta: nextHasta });
    }
  }

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-borderSoft bg-bg p-0.5">
      {RANGOS_SEMANAS.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange({ tipo: "preset", semanas: r })}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            valor.tipo === "preset" && valor.semanas === r
              ? "bg-surface2 text-brand-ink shadow-sm"
              : "text-textDim hover:text-textStrong"
          )}
        >
          {r} sem.
        </button>
      ))}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              esPersonalizado ? "bg-surface2 text-brand-ink shadow-sm" : "text-textDim hover:text-textStrong"
            )}
          >
            {esPersonalizado ? `${valor.desde} → ${valor.hasta}` : "Personalizado"}
            <ChevronDown className="size-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-textDim">Periodo personalizado</p>
          <div className="space-y-3">
            <label className="block text-xs font-medium text-textDim">
              Desde
              <input
                type="date"
                value={desde}
                max={hasta}
                onChange={(e) => aplicar(e.target.value, hasta)}
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm text-textStrong shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </label>
            <label className="block text-xs font-medium text-textDim">
              Hasta
              <input
                type="date"
                value={hasta}
                min={desde}
                onChange={(e) => aplicar(desde, e.target.value)}
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm text-textStrong shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </label>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
