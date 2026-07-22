"use client";

import { ChevronDown, ChevronUp, Info, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CampoFormulario, TipoCampoFormulario, VariableDestino } from "@/lib/store";

const campoClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

const TIPO_OPCIONES: { value: TipoCampoFormulario; label: string }[] = [
  { value: "escala-0-10", label: "Escala 0-10 (slider)" },
  { value: "numero", label: "Número" },
  { value: "texto", label: "Texto corto" },
  { value: "seleccion", label: "Selección (opciones)" },
];

const VARIABLE_DESTINO_OPCIONES: { value: string; label: string }[] = [
  { value: "", label: "Ninguna" },
  { value: "dolor", label: "Dolor" },
  { value: "rpe", label: "RPE" },
  { value: "carga", label: "Carga" },
];

let contadorCampo = 0;
function nuevoCampoId(): string {
  contadorCampo += 1;
  return `campo-${Date.now().toString(36)}-${contadorCampo}`;
}

/**
 * Editor de campos de un FormularioDef — añadir/reordenar/eliminar, mismo
 * patrón que `EjerciciosSesionEditor`. `variableDestino` es lo que conecta
 * la respuesta con las gráficas del atleta (Evolución en el tab Datos).
 */
export function CamposFormularioEditor({
  campos,
  onChange,
}: {
  campos: CampoFormulario[];
  onChange: (next: CampoFormulario[]) => void;
}) {
  function actualizar(i: number, patch: Partial<CampoFormulario>) {
    onChange(campos.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }

  function quitar(i: number) {
    onChange(campos.filter((_, idx) => idx !== i));
  }

  function mover(i: number, direccion: -1 | 1) {
    const j = i + direccion;
    if (j < 0 || j >= campos.length) return;
    const next = [...campos];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  function anadir() {
    onChange([...campos, { id: nuevoCampoId(), etiqueta: "", tipo: "escala-0-10", variableDestino: null }]);
  }

  return (
    <div className="space-y-3">
      {campos.length === 0 && <p className="text-sm text-textDim">Sin campos todavía. Añade el primero.</p>}
      {campos.map((campo, i) => {
        const esNumerico = campo.tipo === "escala-0-10" || campo.tipo === "numero";
        return (
          <div key={campo.id} className="rounded-lg border border-borderSoft bg-bg p-3">
            <div className="flex items-start gap-2">
              <div className="flex shrink-0 flex-col items-center justify-center gap-0.5 pt-1">
                <button
                  type="button"
                  onClick={() => mover(i, -1)}
                  disabled={i === 0}
                  className="rounded p-0.5 text-textDim transition-colors hover:text-brand-ink disabled:opacity-30"
                  aria-label="Subir campo"
                >
                  <ChevronUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => mover(i, 1)}
                  disabled={i === campos.length - 1}
                  className="rounded p-0.5 text-textDim transition-colors hover:text-brand-ink disabled:opacity-30"
                  aria-label="Bajar campo"
                >
                  <ChevronDown className="size-3.5" />
                </button>
              </div>

              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr]">
                  <Input
                    value={campo.etiqueta}
                    onChange={(e) => actualizar(i, { etiqueta: e.target.value })}
                    placeholder="Etiqueta del campo (ej. Dolor hoy)"
                    aria-label="Etiqueta del campo"
                  />
                  <select
                    value={campo.tipo}
                    onChange={(e) => actualizar(i, { tipo: e.target.value as TipoCampoFormulario })}
                    className={campoClass}
                    aria-label="Tipo de campo"
                  >
                    {TIPO_OPCIONES.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                {campo.tipo === "seleccion" && (
                  <Input
                    value={(campo.opciones ?? []).join(", ")}
                    onChange={(e) =>
                      actualizar(i, {
                        opciones: e.target.value
                          .split(",")
                          .map((o) => o.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Opciones separadas por coma"
                    aria-label="Opciones de selección"
                  />
                )}

                {esNumerico && (
                  <div className="flex items-center gap-1.5">
                    <select
                      value={campo.variableDestino ?? ""}
                      onChange={(e) =>
                        actualizar(i, { variableDestino: (e.target.value || null) as VariableDestino })
                      }
                      className={cn(campoClass, "max-w-[220px]")}
                      aria-label="Variable destino"
                    >
                      {VARIABLE_DESTINO_OPCIONES.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <span
                      title="Si eliges dolor, RPE o carga, la respuesta se añade automáticamente al gráfico de Evolución del atleta."
                      className="shrink-0 text-textDim"
                    >
                      <Info className="size-3.5" />
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => quitar(i)}
                className="shrink-0 rounded-md p-2 text-textDim transition-colors hover:bg-state-bad/10 hover:text-state-bad"
                aria-label="Quitar campo"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        );
      })}
      <Button type="button" variant="outline" size="sm" onClick={anadir}>
        <Plus className="size-3.5" />
        Añadir campo
      </Button>
    </div>
  );
}
