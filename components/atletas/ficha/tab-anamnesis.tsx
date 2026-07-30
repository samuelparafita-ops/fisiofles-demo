"use client";

import { useState } from "react";
import { FileQuestion, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { CampoEditable } from "@/components/atletas/campo-editable";
import { accionActualizar, useDispatch, type Atleta, type PreguntaAnamnesis } from "@/lib/store";

const inputClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";
const textareaClass =
  "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

/**
 * Cuestionario inicial del atleta (pares pregunta/respuesta) — la PREGUNTA
 * actúa de label fija (como en cualquier `CampoEditable`), solo la RESPUESTA
 * es editable inline. Añadir/eliminar pares es la única forma de tocar las
 * preguntas en sí.
 */
export function TabAnamnesis({ atleta }: { atleta: Atleta }) {
  const dispatch = useDispatch();
  const pares = atleta.anamnesis ?? [];
  const [anadiendo, setAnadiendo] = useState(false);
  const [nuevaPregunta, setNuevaPregunta] = useState("");
  const [nuevaRespuesta, setNuevaRespuesta] = useState("");

  function guardar(next: PreguntaAnamnesis[]) {
    dispatch(accionActualizar("atletas", atleta.id, { anamnesis: next }));
  }

  function actualizarRespuesta(indice: number, respuesta: string) {
    guardar(pares.map((p, i) => (i === indice ? { ...p, respuesta } : p)));
  }

  function eliminar(indice: number) {
    guardar(pares.filter((_, i) => i !== indice));
  }

  function anadir() {
    const pregunta = nuevaPregunta.trim();
    if (!pregunta) return;
    guardar([...pares, { pregunta, respuesta: nuevaRespuesta.trim() }]);
    setNuevaPregunta("");
    setNuevaRespuesta("");
    setAnadiendo(false);
  }

  function cancelarNueva() {
    setNuevaPregunta("");
    setNuevaRespuesta("");
    setAnadiendo(false);
  }

  return (
    <div className="rounded-xl border border-borderSoft bg-surface2 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-bold text-textStrong">Anamnesis</h3>
          <p className="mt-0.5 text-xs text-textDim">Cuestionario inicial de {atleta.nombre}.</p>
        </div>
        {!anadiendo && (
          <Button type="button" variant="outline" size="sm" onClick={() => setAnadiendo(true)}>
            <Plus className="size-3.5" />
            Añadir pregunta
          </Button>
        )}
      </div>

      {anadiendo && (
        <div className="mt-4 space-y-3 rounded-lg border border-borderSoft bg-bg p-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-textDim" htmlFor="anamnesis-nueva-pregunta">
              Pregunta
            </label>
            <input
              id="anamnesis-nueva-pregunta"
              autoFocus
              value={nuevaPregunta}
              onChange={(e) => setNuevaPregunta(e.target.value)}
              placeholder="Ej. ¿Practica algún deporte adicional?"
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-textDim" htmlFor="anamnesis-nueva-respuesta">
              Respuesta
            </label>
            <textarea
              id="anamnesis-nueva-respuesta"
              rows={2}
              value={nuevaRespuesta}
              onChange={(e) => setNuevaRespuesta(e.target.value)}
              className={textareaClass}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={cancelarNueva}>
              Cancelar
            </Button>
            <Button type="button" size="sm" onClick={anadir} disabled={!nuevaPregunta.trim()}>
              Guardar
            </Button>
          </div>
        </div>
      )}

      {pares.length === 0 && !anadiendo ? (
        <div className="mt-4">
          <EmptyState
            icon={FileQuestion}
            title="Sin anamnesis registrada"
            description="Este atleta todavía no tiene un cuestionario inicial. Añade la primera pregunta."
          />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-x-10 md:grid-cols-2">
          {pares.map((p, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <div className="min-w-0 flex-1">
                <CampoEditable
                  label={p.pregunta}
                  value={p.respuesta}
                  tipo="textarea"
                  onGuardar={(v) => actualizarRespuesta(i, v)}
                />
              </div>
              <button
                type="button"
                onClick={() => eliminar(i)}
                className="mt-6 shrink-0 rounded-md p-1.5 text-textDim transition-colors hover:bg-bg hover:text-destructive"
                aria-label={`Eliminar pregunta «${p.pregunta}»`}
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
