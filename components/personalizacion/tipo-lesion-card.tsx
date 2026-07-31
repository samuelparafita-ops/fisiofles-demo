"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CampoEditable } from "@/components/atletas/campo-editable";
import { FaseChip } from "./fase-chip";
import { EliminarLesionDialog, type ObjetivoEliminar } from "./eliminar-lesion-dialog";
import { useToast } from "@/components/shared/toast";
import { accionActualizar, useDispatch, type FaseLesion, type TipoLesion } from "@/lib/store";

export function TipoLesionCard({ tipo }: { tipo: TipoLesion }) {
  const dispatch = useDispatch();
  const toast = useToast();
  const [eliminarObjetivo, setEliminarObjetivo] = useState<ObjetivoEliminar | null>(null);
  const especial = tipo.esRendimiento === true;

  function actualizarFases(fases: FaseLesion[]) {
    dispatch(accionActualizar("tiposLesion", tipo.id, { fases }));
  }

  function moverFase(indice: number, dir: -1 | 1) {
    const destino = indice + dir;
    if (destino < 0 || destino >= tipo.fases.length) return;
    const next = [...tipo.fases];
    [next[indice], next[destino]] = [next[destino], next[indice]];
    actualizarFases(next);
  }

  function actualizarFase(faseId: string, patch: Partial<FaseLesion>) {
    actualizarFases(tipo.fases.map((f) => (f.id === faseId ? { ...f, ...patch } : f)));
  }

  function agregarFase() {
    const numero = tipo.fases.length + 1;
    const nueva: FaseLesion = { id: `${tipo.id}-fase-${Date.now().toString(36)}`, nombre: `Fase ${numero}` };
    actualizarFases([...tipo.fases, nueva]);
    toast("Fase añadida", `${nueva.nombre} se ha añadido a ${tipo.nombre}.`);
  }

  return (
    <div className="rounded-xl border border-borderSoft bg-bg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <CampoEditable
            label="Nombre"
            value={tipo.nombre}
            onGuardar={(nombre) => dispatch(accionActualizar("tiposLesion", tipo.id, { nombre }))}
          />
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-4">
          <Badge variant="outline" className="border-borderSoft text-textDim">
            {tipo.fases.length} {tipo.fases.length === 1 ? "fase" : "fases"}
          </Badge>
          {!especial && (
            <button
              type="button"
              onClick={() => setEliminarObjetivo({ kind: "tipo", tipo })}
              aria-label={`Eliminar ${tipo.nombre}`}
              className="rounded-md p-1.5 text-textDim transition-colors hover:bg-surface2 hover:text-state-bad"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {tipo.fases.map((fase, i) => (
          <FaseChip
            key={fase.id}
            fase={fase}
            indice={i}
            total={tipo.fases.length}
            puedeSubir={i > 0}
            puedeBajar={i < tipo.fases.length - 1}
            puedeEliminar={tipo.fases.length > 1}
            onMover={(dir) => moverFase(i, dir)}
            onActualizar={(patch) => actualizarFase(fase.id, patch)}
            onEliminar={() => setEliminarObjetivo({ kind: "fase", tipo, fase })}
          />
        ))}
        {!especial && (
          <Button type="button" variant="outline" size="sm" onClick={agregarFase}>
            <Plus className="size-3.5" />
            Añadir fase
          </Button>
        )}
      </div>

      {especial && (
        <p className="mt-3 text-xs text-textDim">
          Tipo especial para atletas sin lesión activa: una única fase, no se puede eliminar ni ampliar.
        </p>
      )}

      {eliminarObjetivo && (
        <EliminarLesionDialog objetivo={eliminarObjetivo} onClose={() => setEliminarObjetivo(null)} />
      )}
    </div>
  );
}
