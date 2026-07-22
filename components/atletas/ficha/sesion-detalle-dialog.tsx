"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/shared/toast";
import { EjerciciosSesionEditor } from "@/components/atletas/ficha/ejercicios-sesion-editor";
import { diaSemanaDeIso } from "@/components/atletas/ficha/fecha-utils";
import { accionActualizar, useDispatch, type EjercicioProgramado, type EstadoSesion, type Sesion } from "@/lib/store";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

const ESTADO_OPCIONES: { value: EstadoSesion; label: string }[] = [
  { value: "programada", label: "Programada" },
  { value: "completada", label: "Completada" },
  { value: "cancelada", label: "Cancelada" },
];

/**
 * Diálogo canónico de edición de sesión — se usa tanto en el tab Calendario
 * como en el tab Programación (misma pieza, mismo store: editar aquí es
 * editar allí, y también se refleja en Inicio si la sesión es de hoy).
 */
export function SesionDetalleDialog({ sesion, onClose }: { sesion: Sesion; onClose: () => void }) {
  const dispatch = useDispatch();
  const toast = useToast();

  const [nombre, setNombre] = useState(sesion.nombre);
  const [fecha, setFecha] = useState(sesion.fecha);
  const [estado, setEstado] = useState<EstadoSesion>(sesion.estado);
  const [ejercicios, setEjercicios] = useState<EjercicioProgramado[]>(sesion.ejercicios);
  const [notas, setNotas] = useState(sesion.notas ?? "");

  useEffect(() => {
    setNombre(sesion.nombre);
    setFecha(sesion.fecha);
    setEstado(sesion.estado);
    setEjercicios(sesion.ejercicios);
    setNotas(sesion.notas ?? "");
  }, [sesion]);

  function guardar() {
    dispatch(
      accionActualizar("sesiones", sesion.id, {
        nombre,
        fecha,
        dia: diaSemanaDeIso(fecha),
        estado,
        ejercicios,
        notas: notas.trim() || undefined,
      })
    );
    toast("Sesión actualizada", `${nombre} se ha guardado y se refleja en toda la app.`);
    onClose();
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar sesión</DialogTitle>
          <DialogDescription>
            Los cambios se guardan en el store y se reflejan en Calendario, Programación e Inicio.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sesion-nombre">Nombre</Label>
              <Input id="sesion-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sesion-fecha">Fecha</Label>
              <Input
                id="sesion-fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sesion-estado">Estado</Label>
            <select
              id="sesion-estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value as EstadoSesion)}
              className={selectClass}
            >
              {ESTADO_OPCIONES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>Ejercicios</Label>
            <EjerciciosSesionEditor ejercicios={ejercicios} onChange={setEjercicios} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sesion-notas">Notas (opcional)</Label>
            <textarea
              id="sesion-notas"
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={guardar}>
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
