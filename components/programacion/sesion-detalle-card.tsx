"use client";

import { CheckCircle2, Dumbbell, Pencil } from "lucide-react";
import { bloquesDeSesion, useEjercicios } from "@/lib/store";
import type { Sesion } from "@/lib/store";

/**
 * Sesión de un bloque semanal, siempre expandida — la semana (bloque) es
 * ahora el nivel que se colapsa (ver `ProgramacionView`, FASE 7); las
 * sesiones dentro ya no se pliegan por día. Sustituye a `SesionAccordion`.
 * Agrupa los ejercicios por sub-bloque vía `bloquesDeSesion()` (FASE 5) —
 * funciona igual con sesiones v4 (`bloquesEjercicios`) y con las legado
 * (`ejercicios` plano, envuelto en un único bloque "Principal").
 */
export function SesionDetalleCard({
  sesion,
  onEditar,
}: {
  sesion: Sesion;
  /** Mismo diálogo de edición que usa el tab Calendario. */
  onEditar?: (sesion: Sesion) => void;
}) {
  const ejercicios = useEjercicios();
  const bloques = bloquesDeSesion(sesion);
  const totalEjercicios = bloques.reduce((total, b) => total + b.ejercicios.length, 0);

  return (
    <div className="overflow-hidden rounded-xl border border-borderSoft bg-surface2 shadow-sm">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand-ink">
            <Dumbbell className="size-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink">{sesion.dia}</p>
            <p className="font-display text-sm font-bold text-textStrong">{sesion.nombre}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{totalEjercicios} ejercicios</span>
          {sesion.estado === "completada" && (
            <span className="flex items-center gap-1 text-xs font-medium text-state-good">
              <CheckCircle2 className="size-3.5" />
              Completada
            </span>
          )}
          {sesion.estado === "cancelada" && (
            <span className="text-xs font-medium text-textDim">Cancelada</span>
          )}
          {onEditar && (
            <button
              type="button"
              onClick={() => onEditar(sesion)}
              className="rounded-md p-1.5 text-textDim transition-colors hover:bg-bg hover:text-brand-ink"
              aria-label="Editar sesión"
            >
              <Pencil className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-borderSoft border-t border-borderSoft">
        {bloques.map((bloque) => (
          <div key={bloque.id}>
            {bloques.length > 1 && (
              <p className="bg-bg px-5 py-1.5 text-xs font-semibold uppercase tracking-wide text-textDim">
                {bloque.nombre}
              </p>
            )}
            {bloque.ejercicios.length === 0 ? (
              <p className="px-5 py-3 text-sm text-textDim">Sin ejercicios.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="bg-bg text-left text-xs uppercase tracking-wide text-textDim">
                      <th className="px-5 py-2.5 font-medium">Ejercicio</th>
                      <th className="px-4 py-2.5 font-medium">Series × reps</th>
                      <th className="px-4 py-2.5 font-medium">Carga</th>
                      <th className="px-4 py-2.5 font-medium">Detalle</th>
                      <th className="px-4 py-2.5 font-medium">Variables a medir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bloque.ejercicios.map((ej, idx) => {
                      const info = ejercicios.find((e) => e.id === ej.ejercicioId);
                      const detalle = [
                        ej.rpeObjetivo !== undefined ? `RPE ${ej.rpeObjetivo}` : null,
                        ej.descanso ? `Desc. ${ej.descanso}` : null,
                        ej.ratioSeries ? `Ratio ${ej.ratioSeries}` : null,
                      ].filter(Boolean);
                      return (
                        <tr key={`${ej.ejercicioId}-${idx}`} className="border-t border-borderSoft align-top">
                          <td className="px-5 py-3">
                            <p className="font-medium text-textStrong">{info?.nombre ?? ej.ejercicioId}</p>
                            {info && <p className="mt-0.5 text-xs text-textDim">{info.patron}</p>}
                            {ej.notas && <p className="mt-1.5 text-xs italic text-textDim">{ej.notas}</p>}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-text">
                            {ej.series} × {ej.repeticiones}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-text">{ej.carga}</td>
                          <td className="px-4 py-3 text-xs text-textDim">
                            {detalle.length > 0 ? detalle.join(" · ") : "—"}
                          </td>
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
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
