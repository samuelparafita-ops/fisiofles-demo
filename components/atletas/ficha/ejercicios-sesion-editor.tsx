"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEjercicios, type EjercicioProgramado } from "@/lib/store";
import { VARIABLES_MEDIBLES } from "@/lib/mock/ejercicios";

const campoClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

/**
 * Editor de la lista de ejercicios de una sesión — compartido por el diálogo
 * de detalle/edición (Calendario) y el de nueva sesión, para que "editar
 * aquí = editar allí" también aplique a esta pieza.
 */
export function EjerciciosSesionEditor({
  ejercicios,
  onChange,
}: {
  ejercicios: EjercicioProgramado[];
  onChange: (next: EjercicioProgramado[]) => void;
}) {
  const libreria = useEjercicios();

  function actualizar(i: number, patch: Partial<EjercicioProgramado>) {
    onChange(ejercicios.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  }

  function quitar(i: number) {
    onChange(ejercicios.filter((_, idx) => idx !== i));
  }

  function anadir() {
    onChange([
      ...ejercicios,
      {
        ejercicioId: libreria[0]?.id ?? "",
        series: 3,
        repeticiones: "10",
        carga: "—",
        variablesAMedir: [],
      },
    ]);
  }

  function toggleVariable(i: number, variable: (typeof VARIABLES_MEDIBLES)[number]) {
    const actual = ejercicios[i].variablesAMedir;
    const nuevas = actual.includes(variable)
      ? actual.filter((v) => v !== variable)
      : [...actual, variable];
    actualizar(i, { variablesAMedir: nuevas });
  }

  return (
    <div className="space-y-3">
      {ejercicios.length === 0 && (
        <p className="text-sm text-textDim">Sin ejercicios todavía. Añade el primero.</p>
      )}
      {ejercicios.map((ej, i) => (
        <div key={i} className="rounded-lg border border-borderSoft bg-bg p-3">
          <div className="flex items-start gap-2">
            <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-[2fr_1fr_1fr_1fr]">
              <select
                value={ej.ejercicioId}
                onChange={(e) => actualizar(i, { ejercicioId: e.target.value })}
                className={cn(campoClass, "col-span-2 sm:col-span-1")}
              >
                {libreria.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nombre}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={ej.series}
                onChange={(e) => actualizar(i, { series: Number(e.target.value) || 1 })}
                placeholder="Series"
                aria-label="Series"
                className={campoClass}
              />
              <input
                value={ej.repeticiones}
                onChange={(e) => actualizar(i, { repeticiones: e.target.value })}
                placeholder="Reps"
                aria-label="Repeticiones"
                className={campoClass}
              />
              <input
                value={ej.carga}
                onChange={(e) => actualizar(i, { carga: e.target.value })}
                placeholder="Carga"
                aria-label="Carga"
                className={campoClass}
              />
            </div>
            <button
              type="button"
              onClick={() => quitar(i)}
              className="shrink-0 rounded-md p-2 text-textDim transition-colors hover:bg-state-bad/10 hover:text-state-bad"
              aria-label="Quitar ejercicio"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {VARIABLES_MEDIBLES.map((v) => {
              const activo = ej.variablesAMedir.includes(v);
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => toggleVariable(i, v)}
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors",
                    activo
                      ? "border-brand bg-brand-tint text-brand-ink"
                      : "border-borderSoft text-textDim hover:border-brand/50"
                  )}
                >
                  {v}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={anadir}>
        <Plus className="size-3.5" />
        Añadir ejercicio
      </Button>
    </div>
  );
}
