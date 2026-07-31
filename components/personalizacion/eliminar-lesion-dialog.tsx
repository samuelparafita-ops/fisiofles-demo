"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/shared/toast";
import {
  accionActualizar,
  accionEliminar,
  useAtletas,
  useDispatch,
  useTiposLesion,
  type FaseLesion,
  type TipoLesion,
} from "@/lib/store";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export type ObjetivoEliminar =
  | { kind: "tipo"; tipo: TipoLesion }
  | { kind: "fase"; tipo: TipoLesion; fase: FaseLesion };

/**
 * Confirma y ejecuta el borrado de un tipo de lesión completo o de una única
 * fase. Si hay atletas asignados (`lesionId`/`faseId`), exige reasignarlos a
 * un destino antes de borrar — nunca deja referencias huérfanas (ver CLAUDE.md
 * > Lesiones, fases y semáforo).
 */
export function EliminarLesionDialog({
  objetivo,
  onClose,
}: {
  objetivo: ObjetivoEliminar;
  onClose: () => void;
}) {
  const atletas = useAtletas();
  const tiposLesion = useTiposLesion();
  const dispatch = useDispatch();
  const toast = useToast();

  const afectados = useMemo(() => {
    if (objetivo.kind === "tipo") return atletas.filter((a) => a.lesionId === objetivo.tipo.id);
    return atletas.filter((a) => a.lesionId === objetivo.tipo.id && a.faseId === objetivo.fase.id);
  }, [atletas, objetivo]);

  const opcionesTipoDestino =
    objetivo.kind === "tipo" ? tiposLesion.filter((t) => t.id !== objetivo.tipo.id) : [];
  const [tipoDestinoId, setTipoDestinoId] = useState(opcionesTipoDestino[0]?.id ?? "");
  const tipoDestino = tiposLesion.find((t) => t.id === tipoDestinoId);

  const fasesDestino =
    objetivo.kind === "tipo" ? tipoDestino?.fases ?? [] : objetivo.tipo.fases.filter((f) => f.id !== objetivo.fase.id);
  const [faseDestinoIdElegido, setFaseDestinoIdElegido] = useState("");
  const faseDestinoId = fasesDestino.some((f) => f.id === faseDestinoIdElegido)
    ? faseDestinoIdElegido
    : fasesDestino[0]?.id ?? "";

  const nombreObjetivo = objetivo.kind === "tipo" ? objetivo.tipo.nombre : objetivo.fase.nombre;
  const necesitaReasignar = afectados.length > 0;
  const puedeConfirmar =
    !necesitaReasignar || (Boolean(faseDestinoId) && (objetivo.kind === "fase" || Boolean(tipoDestinoId)));

  function confirmar() {
    if (!puedeConfirmar) return;

    if (objetivo.kind === "tipo") {
      if (necesitaReasignar) {
        afectados.forEach((a) =>
          dispatch(accionActualizar("atletas", a.id, { lesionId: tipoDestinoId, faseId: faseDestinoId }))
        );
      }
      dispatch(accionEliminar("tiposLesion", objetivo.tipo.id));
      toast("Tipo de lesión eliminado", `${objetivo.tipo.nombre} se ha borrado de la demo.`);
    } else {
      if (necesitaReasignar) {
        afectados.forEach((a) => dispatch(accionActualizar("atletas", a.id, { faseId: faseDestinoId })));
      }
      dispatch(
        accionActualizar("tiposLesion", objetivo.tipo.id, {
          fases: objetivo.tipo.fases.filter((f) => f.id !== objetivo.fase.id),
        })
      );
      toast("Fase eliminada", `${objetivo.fase.nombre} se ha borrado de ${objetivo.tipo.nombre}.`);
    }
    onClose();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Eliminar {objetivo.kind === "tipo" ? nombreObjetivo : `fase «${nombreObjetivo}»`}
          </DialogTitle>
          <DialogDescription>
            {necesitaReasignar
              ? `${afectados.length} ${afectados.length === 1 ? "atleta tiene" : "atletas tienen"} esto asignado ahora mismo. Elige a dónde reasignarlos antes de borrar.`
              : "No hay ningún atleta asignado aquí. Esta acción no se puede deshacer."}
          </DialogDescription>
        </DialogHeader>

        {necesitaReasignar && (
          <div className="space-y-3">
            <p className="rounded-lg border border-borderSoft bg-bg px-3 py-2 text-xs text-textDim">
              {afectados.map((a) => a.nombre).join(", ")}
            </p>

            {objetivo.kind === "tipo" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-textDim">Nuevo tipo de lesión</label>
                <select
                  className={selectClass}
                  value={tipoDestinoId}
                  onChange={(e) => {
                    setTipoDestinoId(e.target.value);
                    setFaseDestinoIdElegido("");
                  }}
                >
                  {opcionesTipoDestino.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-textDim">Nueva fase</label>
              <select
                className={selectClass}
                value={faseDestinoId}
                onChange={(e) => setFaseDestinoIdElegido(e.target.value)}
              >
                {fasesDestino.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <DialogFooter className="mt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" variant="destructive" disabled={!puedeConfirmar} onClick={confirmar}>
            Eliminar definitivamente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
