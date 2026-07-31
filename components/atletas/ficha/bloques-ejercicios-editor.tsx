"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, ChevronUp, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEjercicios, type BloqueEjercicios, type EjercicioProgramado } from "@/lib/store";
import { VARIABLES_MEDIBLES } from "@/lib/mock/ejercicios";

const campoClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

let contadorBloque = 0;
function nuevoIdBloque(): string {
  contadorBloque += 1;
  return `bloque-${Date.now().toString(36)}-${contadorBloque}`;
}

/**
 * Editor de sub-bloques de una sesión (Preparación → Activación → Bloque
 * principal 1..n, del REHAB CREATION) — reemplaza a `EjerciciosSesionEditor`
 * en `SesionDetalleDialog`/`NuevaSesionDialog` (FASE 5). `EjerciciosSesionEditor`
 * sigue existiendo tal cual para las plantillas (`/plantillas`), que solo
 * manejan un array plano y no sub-bloques — no se ha migrado, no le toca.
 * Cada ejercicio muestra una fila principal (ejercicio/series/reps/carga) y
 * una fila secundaria expandible (RPE/descanso/ratio de series/notas/variables
 * a medir) para no hacer la tabla infinita.
 */
export function BloquesEjerciciosEditor({
  bloques,
  onChange,
}: {
  bloques: BloqueEjercicios[];
  onChange: (next: BloqueEjercicios[]) => void;
}) {
  const libreria = useEjercicios();
  const [busqueda, setBusqueda] = useState("");
  const [expandido, setExpandido] = useState<Record<string, boolean>>({});

  const libreriaFiltrada = busqueda.trim()
    ? libreria.filter((l) => {
        const q = busqueda.trim().toLowerCase();
        return l.nombre.toLowerCase().includes(q) || (l.etiquetas ?? []).some((t) => t.toLowerCase().includes(q));
      })
    : libreria;

  function actualizarBloque(bloqueIdx: number, patch: Partial<BloqueEjercicios>) {
    onChange(bloques.map((b, i) => (i === bloqueIdx ? { ...b, ...patch } : b)));
  }

  function moverBloque(bloqueIdx: number, dir: -1 | 1) {
    const j = bloqueIdx + dir;
    if (j < 0 || j >= bloques.length) return;
    const next = [...bloques];
    [next[bloqueIdx], next[j]] = [next[j], next[bloqueIdx]];
    onChange(next);
  }

  function eliminarBloque(bloqueIdx: number) {
    onChange(bloques.filter((_, i) => i !== bloqueIdx));
  }

  function anadirBloque() {
    onChange([...bloques, { id: nuevoIdBloque(), nombre: `Bloque ${bloques.length + 1}`, ejercicios: [] }]);
  }

  function actualizarEjercicio(bloqueIdx: number, ejIdx: number, patch: Partial<EjercicioProgramado>) {
    const ejercicios = bloques[bloqueIdx].ejercicios.map((e, i) => (i === ejIdx ? { ...e, ...patch } : e));
    actualizarBloque(bloqueIdx, { ejercicios });
  }

  function quitarEjercicio(bloqueIdx: number, ejIdx: number) {
    actualizarBloque(bloqueIdx, { ejercicios: bloques[bloqueIdx].ejercicios.filter((_, i) => i !== ejIdx) });
  }

  function moverEjercicioDentro(bloqueIdx: number, ejIdx: number, dir: -1 | 1) {
    const ejercicios = bloques[bloqueIdx].ejercicios;
    const j = ejIdx + dir;
    if (j < 0 || j >= ejercicios.length) return;
    const next = [...ejercicios];
    [next[ejIdx], next[j]] = [next[j], next[ejIdx]];
    actualizarBloque(bloqueIdx, { ejercicios: next });
  }

  function moverEjercicioABloque(bloqueIdxOrigen: number, ejIdx: number, bloqueIdxDestino: number) {
    if (bloqueIdxOrigen === bloqueIdxDestino) return;
    const ejercicio = bloques[bloqueIdxOrigen].ejercicios[ejIdx];
    onChange(
      bloques.map((b, i) => {
        if (i === bloqueIdxOrigen) return { ...b, ejercicios: b.ejercicios.filter((_, idx) => idx !== ejIdx) };
        if (i === bloqueIdxDestino) return { ...b, ejercicios: [...b.ejercicios, ejercicio] };
        return b;
      })
    );
  }

  function anadirEjercicio(bloqueIdx: number) {
    actualizarBloque(bloqueIdx, {
      ejercicios: [
        ...bloques[bloqueIdx].ejercicios,
        {
          ejercicioId: (libreriaFiltrada[0] ?? libreria[0])?.id ?? "",
          series: 3,
          repeticiones: "10",
          carga: "—",
          variablesAMedir: [],
        },
      ],
    });
  }

  function toggleVariable(bloqueIdx: number, ejIdx: number, variable: (typeof VARIABLES_MEDIBLES)[number]) {
    const actual = bloques[bloqueIdx].ejercicios[ejIdx].variablesAMedir;
    const nuevas = actual.includes(variable) ? actual.filter((v) => v !== variable) : [...actual, variable];
    actualizarEjercicio(bloqueIdx, ejIdx, { variablesAMedir: nuevas });
  }

  function toggleExpandido(key: string) {
    setExpandido((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="space-y-4">
      {bloques.some((b) => b.ejercicios.length > 0) && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-textDim" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar en la librería de ejercicios..."
            aria-label="Buscar ejercicio"
            className={cn(campoClass, "pl-8")}
          />
        </div>
      )}

      {bloques.map((bloque, bloqueIdx) => (
        <div key={bloque.id} className="rounded-lg border border-borderSoft bg-surface2">
          <div className="flex items-center gap-2 border-b border-borderSoft px-3 py-2">
            <div className="flex shrink-0 flex-col items-center justify-center gap-0.5">
              <button
                type="button"
                onClick={() => moverBloque(bloqueIdx, -1)}
                disabled={bloqueIdx === 0}
                className="rounded p-0.5 text-textDim transition-colors hover:text-brand-ink disabled:opacity-30"
                aria-label="Subir bloque"
              >
                <ChevronUp className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => moverBloque(bloqueIdx, 1)}
                disabled={bloqueIdx === bloques.length - 1}
                className="rounded p-0.5 text-textDim transition-colors hover:text-brand-ink disabled:opacity-30"
                aria-label="Bajar bloque"
              >
                <ChevronDown className="size-3.5" />
              </button>
            </div>
            <input
              value={bloque.nombre}
              onChange={(e) => actualizarBloque(bloqueIdx, { nombre: e.target.value })}
              className="h-8 flex-1 rounded-md border border-transparent bg-transparent px-2 text-sm font-semibold text-textStrong transition-colors hover:border-borderSoft focus-visible:border-input focus-visible:outline-none"
              aria-label="Nombre del bloque"
            />
            <button
              type="button"
              onClick={() => eliminarBloque(bloqueIdx)}
              className="shrink-0 rounded-md p-1.5 text-textDim transition-colors hover:bg-state-bad/10 hover:text-state-bad"
              aria-label="Eliminar bloque"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>

          <div className="space-y-2 p-3">
            {bloque.ejercicios.length === 0 && (
              <p className="text-sm text-textDim">Sin ejercicios en este bloque.</p>
            )}
            {bloque.ejercicios.map((ej, ejIdx) => {
              const key = `${bloque.id}-${ejIdx}`;
              const abierto = expandido[key] ?? false;
              const seleccionadoFueraDeFiltro =
                busqueda.trim() && !libreriaFiltrada.some((l) => l.id === ej.ejercicioId)
                  ? libreria.find((l) => l.id === ej.ejercicioId)
                  : undefined;
              return (
                <div key={ejIdx} className="rounded-lg border border-borderSoft bg-bg p-2.5">
                  <div className="flex items-start gap-2">
                    <div className="flex shrink-0 flex-col items-center justify-center gap-0.5 pt-1">
                      <button
                        type="button"
                        onClick={() => moverEjercicioDentro(bloqueIdx, ejIdx, -1)}
                        disabled={ejIdx === 0}
                        className="rounded p-0.5 text-textDim transition-colors hover:text-brand-ink disabled:opacity-30"
                        aria-label="Subir ejercicio"
                      >
                        <ChevronUp className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moverEjercicioDentro(bloqueIdx, ejIdx, 1)}
                        disabled={ejIdx === bloque.ejercicios.length - 1}
                        className="rounded p-0.5 text-textDim transition-colors hover:text-brand-ink disabled:opacity-30"
                        aria-label="Bajar ejercicio"
                      >
                        <ChevronDown className="size-3.5" />
                      </button>
                    </div>
                    <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-[2fr_1fr_1fr_1fr]">
                      <select
                        value={ej.ejercicioId}
                        onChange={(e) => actualizarEjercicio(bloqueIdx, ejIdx, { ejercicioId: e.target.value })}
                        className={cn(campoClass, "col-span-2 sm:col-span-1")}
                      >
                        {seleccionadoFueraDeFiltro && (
                          <option value={seleccionadoFueraDeFiltro.id}>{seleccionadoFueraDeFiltro.nombre}</option>
                        )}
                        {libreriaFiltrada.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.nombre}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        value={ej.series}
                        onChange={(e) => actualizarEjercicio(bloqueIdx, ejIdx, { series: Number(e.target.value) || 1 })}
                        placeholder="Series"
                        aria-label="Series"
                        className={campoClass}
                      />
                      <input
                        value={ej.repeticiones}
                        onChange={(e) => actualizarEjercicio(bloqueIdx, ejIdx, { repeticiones: e.target.value })}
                        placeholder="Reps"
                        aria-label="Repeticiones"
                        className={campoClass}
                      />
                      <input
                        value={ej.carga}
                        onChange={(e) => actualizarEjercicio(bloqueIdx, ejIdx, { carga: e.target.value })}
                        placeholder="Carga"
                        aria-label="Carga"
                        className={campoClass}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleExpandido(key)}
                      className="shrink-0 rounded-md p-2 text-textDim transition-colors hover:bg-bg hover:text-brand-ink"
                      aria-label={abierto ? "Contraer detalle" : "Expandir detalle"}
                    >
                      <ChevronRight className={cn("size-4 transition-transform", abierto && "rotate-90")} />
                    </button>
                    <button
                      type="button"
                      onClick={() => quitarEjercicio(bloqueIdx, ejIdx)}
                      className="shrink-0 rounded-md p-2 text-textDim transition-colors hover:bg-state-bad/10 hover:text-state-bad"
                      aria-label="Quitar ejercicio"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  {abierto && (
                    <div className="mt-2.5 space-y-2.5 border-t border-borderSoft pt-2.5">
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <input
                          value={ej.rpeObjetivo ?? ""}
                          onChange={(e) =>
                            actualizarEjercicio(bloqueIdx, ejIdx, {
                              rpeObjetivo: e.target.value === "" ? undefined : Number(e.target.value),
                            })
                          }
                          type="number"
                          min={0}
                          max={10}
                          step={0.5}
                          placeholder="RPE"
                          aria-label="RPE objetivo del ejercicio"
                          className={campoClass}
                        />
                        <input
                          value={ej.descanso ?? ""}
                          onChange={(e) => actualizarEjercicio(bloqueIdx, ejIdx, { descanso: e.target.value || undefined })}
                          placeholder="Descanso (90s)"
                          aria-label="Descanso"
                          className={campoClass}
                        />
                        <input
                          value={ej.ratioSeries ?? ""}
                          onChange={(e) => actualizarEjercicio(bloqueIdx, ejIdx, { ratioSeries: e.target.value || undefined })}
                          placeholder="Ratio (2:1)"
                          aria-label="Ratio de series lesionada:sana"
                          className={campoClass}
                        />
                        {bloques.length > 1 && (
                          <select
                            value={String(bloqueIdx)}
                            onChange={(e) => moverEjercicioABloque(bloqueIdx, ejIdx, Number(e.target.value))}
                            className={campoClass}
                            aria-label="Mover a bloque"
                          >
                            {bloques.map((b, i) => (
                              <option key={b.id} value={String(i)}>
                                {b.nombre}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      <textarea
                        value={ej.notas ?? ""}
                        onChange={(e) => actualizarEjercicio(bloqueIdx, ejIdx, { notas: e.target.value || undefined })}
                        placeholder="Notas"
                        aria-label="Notas del ejercicio"
                        rows={2}
                        className="flex w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {VARIABLES_MEDIBLES.map((v) => {
                          const activo = ej.variablesAMedir.includes(v);
                          return (
                            <button
                              key={v}
                              type="button"
                              onClick={() => toggleVariable(bloqueIdx, ejIdx, v)}
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
                  )}
                </div>
              );
            })}
            <Button type="button" variant="outline" size="sm" onClick={() => anadirEjercicio(bloqueIdx)}>
              <Plus className="size-3.5" />
              Añadir ejercicio
            </Button>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={anadirBloque}>
        <Plus className="size-3.5" />
        Añadir bloque
      </Button>
    </div>
  );
}
