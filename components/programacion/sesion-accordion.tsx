"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEjercicios } from "@/lib/store";
import type { Sesion } from "@/lib/store";

export function SesionAccordion({
  sesion,
  defaultOpen = false,
}: {
  sesion: Sesion;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const ejercicios = useEjercicios();

  return (
    <div className="overflow-hidden rounded-xl border border-borderSoft bg-surface2 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand-ink">
            <Dumbbell className="size-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink">
              {sesion.dia}
            </p>
            <p className="font-display text-sm font-bold text-textStrong">{sesion.nombre}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {sesion.ejercicios.length} ejercicios
          </span>
          {sesion.estado === "completada" && (
            <span className="flex items-center gap-1 text-xs font-medium text-state-good">
              <CheckCircle2 className="size-3.5" />
              Completada
            </span>
          )}
          {sesion.estado === "cancelada" && (
            <span className="text-xs font-medium text-textDim">Cancelada</span>
          )}
          <ChevronDown
            className={cn("size-4 text-textDim transition-transform", open && "rotate-180")}
          />
        </div>
      </button>

      {open && (
        <div className="animate-in fade-in-0 slide-in-from-top-1 border-t border-borderSoft duration-150">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="bg-bg text-left text-xs uppercase tracking-wide text-textDim">
                  <th className="px-5 py-2.5 font-medium">Ejercicio</th>
                  <th className="px-4 py-2.5 font-medium">Series × reps</th>
                  <th className="px-4 py-2.5 font-medium">Carga</th>
                  <th className="px-4 py-2.5 font-medium">Variables a medir</th>
                </tr>
              </thead>
              <tbody>
                {sesion.ejercicios.map((ej) => {
                  const info = ejercicios.find((e) => e.id === ej.ejercicioId);
                  return (
                    <tr key={ej.ejercicioId} className="border-t border-borderSoft align-top">
                      <td className="px-5 py-3">
                        <p className="font-medium text-textStrong">{info?.nombre ?? ej.ejercicioId}</p>
                        {info && <p className="mt-0.5 text-xs text-textDim">{info.patron}</p>}
                        {ej.notas && (
                          <p className="mt-1.5 text-xs italic text-textDim">{ej.notas}</p>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-text">
                        {ej.series} × {ej.repeticiones}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-text">{ej.carga}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {ej.variablesAMedir.map((v) => (
                            <span
                              key={v}
                              className="rounded-full border border-borderSoft bg-bg px-2 py-0.5 text-[11px] text-textDim"
                            >
                              {v}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
