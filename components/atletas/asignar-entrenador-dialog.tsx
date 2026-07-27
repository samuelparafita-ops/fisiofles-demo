"use client";

import type { FormEvent } from "react";
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
import { accionActualizar, useDispatch, useEntrenadores, type Atleta } from "@/lib/store";

const SIN_ASIGNAR = "sin-asignar";

/**
 * Asigna/reasigna el entrenador de un atleta — dispatcha directamente sobre
 * el store, igual que el resto de ediciones de atleta (ver CLAUDE.md > única
 * fuente de verdad).
 */
export function AsignarEntrenadorDialog({
  atleta,
  open,
  onOpenChange,
}: {
  atleta: Atleta;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const entrenadores = useEntrenadores();
  const dispatch = useDispatch();
  const toast = useToast();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const valor = String(form.get("entrenadorId") || SIN_ASIGNAR);
    const entrenadorId = valor === SIN_ASIGNAR ? undefined : valor;

    dispatch(accionActualizar("atletas", atleta.id, { entrenadorId }));

    const entrenador = entrenadores.find((en) => en.id === entrenadorId);
    toast(
      "Entrenador actualizado",
      entrenador
        ? `${entrenador.nombre} lleva ahora el caso de ${atleta.nombre}.`
        : `${atleta.nombre} ha quedado sin entrenador asignado.`
    );
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Asignar entrenador</DialogTitle>
            <DialogDescription>Elige quién lleva el caso de {atleta.nombre}.</DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-1.5">
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-borderSoft px-3 py-2 text-sm transition-colors has-[:checked]:border-brand has-[:checked]:bg-brand-tint">
              <input
                type="radio"
                name="entrenadorId"
                value={SIN_ASIGNAR}
                defaultChecked={!atleta.entrenadorId}
                className="accent-brand"
              />
              <span className="text-textDim">Sin asignar</span>
            </label>
            {entrenadores.map((entrenador) => (
              <label
                key={entrenador.id}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-borderSoft px-3 py-2 text-sm transition-colors has-[:checked]:border-brand has-[:checked]:bg-brand-tint"
              >
                <input
                  type="radio"
                  name="entrenadorId"
                  value={entrenador.id}
                  defaultChecked={atleta.entrenadorId === entrenador.id}
                  className="accent-brand"
                />
                <span className="text-textStrong">{entrenador.nombre}</span>
                <span className="text-textDim">· {entrenador.rol}</span>
              </label>
            ))}
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
