"use client";

import { useState } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SesionSemanaEditor } from "./sesion-semana-editor";
import type { PlantillaPrograma } from "@/lib/store";

/**
 * Semanas de una PlantillaPrograma como acordeones — dentro de cada una,
 * `SesionSemanaEditor` gestiona sus sesiones.
 */
export function SemanasEditor({
  semanas,
  onChange,
}: {
  semanas: PlantillaPrograma["semanas"];
  onChange: (next: PlantillaPrograma["semanas"]) => void;
}) {
  const [abierta, setAbierta] = useState(0);

  function actualizarSemana(i: number, sesiones: PlantillaPrograma["semanas"][number]["sesiones"]) {
    onChange(semanas.map((s, idx) => (idx === i ? { sesiones } : s)));
  }

  function quitarSemana(i: number) {
    onChange(semanas.filter((_, idx) => idx !== i));
    setAbierta(0);
  }

  return (
    <div className="space-y-2">
      {semanas.map((semana, i) => (
        <div key={i} className="overflow-hidden rounded-lg border border-borderSoft bg-bg">
          <div className="flex items-center justify-between gap-2 px-3 py-2">
            <button
              type="button"
              onClick={() => setAbierta((a) => (a === i ? -1 : i))}
              className="flex flex-1 items-center gap-2 text-left"
            >
              <ChevronDown
                className={cn("size-4 shrink-0 text-textDim transition-transform", abierta === i && "rotate-180")}
              />
              <span className="text-sm font-semibold text-textStrong">Semana {i + 1}</span>
              <span className="text-xs text-textDim">
                {semana.sesiones.length} sesión{semana.sesiones.length === 1 ? "" : "es"}
              </span>
            </button>
            <button
              type="button"
              onClick={() => quitarSemana(i)}
              disabled={semanas.length <= 1}
              className="shrink-0 rounded-md p-1.5 text-textDim transition-colors hover:bg-state-bad/10 hover:text-state-bad disabled:pointer-events-none disabled:opacity-30"
              aria-label={`Quitar semana ${i + 1}`}
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
          {abierta === i && (
            <div className="border-t border-borderSoft p-3">
              <SesionSemanaEditor sesiones={semana.sesiones} onChange={(next) => actualizarSemana(i, next)} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
