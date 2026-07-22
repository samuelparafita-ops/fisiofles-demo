"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/shared/toast";
import { EjerciciosSesionEditor } from "@/components/atletas/ficha/ejercicios-sesion-editor";
import { diaSemanaDeIso, hoyIso } from "@/components/atletas/ficha/fecha-utils";
import {
  accionCrear,
  useDispatch,
  usePlantillasSesion,
  type EjercicioProgramado,
  type Sesion,
} from "@/lib/store";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function NuevaSesionDialog({
  atletaId,
  fechaPorDefecto,
}: {
  atletaId: string;
  fechaPorDefecto?: string;
}) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const toast = useToast();
  const plantillas = usePlantillasSesion();

  const [nombre, setNombre] = useState("");
  const [fecha, setFecha] = useState(fechaPorDefecto ?? hoyIso());
  const [plantillaId, setPlantillaId] = useState("");
  const [ejercicios, setEjercicios] = useState<EjercicioProgramado[]>([]);

  useEffect(() => {
    if (open) setFecha(fechaPorDefecto ?? hoyIso());
  }, [open, fechaPorDefecto]);

  function aplicarPlantilla(id: string) {
    setPlantillaId(id);
    const plantilla = plantillas.find((p) => p.id === id);
    if (plantilla) {
      setNombre(plantilla.nombre);
      setEjercicios(plantilla.ejercicios);
    }
  }

  function crear() {
    if (!nombre.trim()) return;
    const nueva: Sesion = {
      id: `ses-${Date.now().toString(36)}`,
      atletaId,
      fecha,
      dia: diaSemanaDeIso(fecha),
      nombre: nombre.trim(),
      ejercicios,
      estado: "programada",
    };
    dispatch(accionCrear("sesiones", nueva));
    toast("Sesión creada", `${nueva.nombre} se ha añadido el ${fecha}.`);
    setNombre("");
    setEjercicios([]);
    setPlantillaId("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-3.5" />
          Nueva sesión
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva sesión</DialogTitle>
          <DialogDescription>Se añade al Calendario y a la Programación del atleta.</DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="nueva-sesion-fecha">Fecha</Label>
              <Input
                id="nueva-sesion-fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nueva-sesion-nombre">Nombre</Label>
              <Input
                id="nueva-sesion-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Fuerza tren inferior"
              />
            </div>
          </div>

          {plantillas.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="nueva-sesion-plantilla">Partir de una plantilla de sesión (opcional)</Label>
              <select
                id="nueva-sesion-plantilla"
                value={plantillaId}
                onChange={(e) => aplicarPlantilla(e.target.value)}
                className={selectClass}
              >
                <option value="">Sin plantilla</option>
                {plantillas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Ejercicios</Label>
            <EjerciciosSesionEditor ejercicios={ejercicios} onChange={setEjercicios} />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={crear} disabled={!nombre.trim()}>
            Crear sesión
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
