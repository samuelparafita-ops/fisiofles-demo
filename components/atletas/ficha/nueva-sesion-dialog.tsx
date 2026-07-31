"use client";

import { useEffect, useState, type ReactNode } from "react";
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
import { BloquesEjerciciosEditor } from "@/components/atletas/ficha/bloques-ejercicios-editor";
import { RpeSelector } from "@/components/programacion/rpe-selector";
import { TipoSesionInput } from "@/components/programacion/tipo-sesion-input";
import { diaSemanaDeIso, hoyIso } from "@/components/atletas/ficha/fecha-utils";
import {
  accionCrear,
  useDispatch,
  usePlantillasSesion,
  type BloqueEjercicios,
  type Sesion,
} from "@/lib/store";

export function NuevaSesionDialog({
  atletaId,
  fechaPorDefecto,
  trigger,
}: {
  atletaId: string;
  fechaPorDefecto?: string;
  /** Trigger custom (ej. botón "+" al hover de una celda vacía en /programacion) — por defecto el botón "Nueva sesión". */
  trigger?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const toast = useToast();
  const plantillas = usePlantillasSesion();

  const [nombre, setNombre] = useState("");
  const [fecha, setFecha] = useState(fechaPorDefecto ?? hoyIso());
  const [tipo, setTipo] = useState("");
  const [rpeObjetivo, setRpeObjetivo] = useState(7);
  const [plantillaId, setPlantillaId] = useState("");
  const [bloques, setBloques] = useState<BloqueEjercicios[]>([{ id: "principal", nombre: "Principal", ejercicios: [] }]);

  useEffect(() => {
    if (open) setFecha(fechaPorDefecto ?? hoyIso());
  }, [open, fechaPorDefecto]);

  function aplicarPlantilla(id: string) {
    setPlantillaId(id);
    const plantilla = plantillas.find((p) => p.id === id);
    if (plantilla) {
      setNombre(plantilla.nombre);
      setBloques([{ id: "principal", nombre: "Principal", ejercicios: plantilla.ejercicios }]);
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
      ejercicios: bloques.flatMap((b) => b.ejercicios),
      estado: "programada",
      tipo: tipo.trim() || undefined,
      rpeObjetivo,
      bloquesEjercicios: bloques,
    };
    dispatch(accionCrear("sesiones", nueva));
    toast("Sesión creada", `${nueva.nombre} se ha añadido el ${fecha}.`);
    setNombre("");
    setTipo("");
    setRpeObjetivo(7);
    setBloques([{ id: "principal", nombre: "Principal", ejercicios: [] }]);
    setPlantillaId("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus className="size-3.5" />
            Nueva sesión
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
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

          <div className="space-y-1.5">
            <Label htmlFor="nueva-sesion-tipo">Tipo</Label>
            <TipoSesionInput id="nueva-sesion-tipo" value={tipo} onChange={setTipo} />
          </div>

          <RpeSelector id="nueva-sesion-rpe" value={rpeObjetivo} onChange={setRpeObjetivo} />

          {plantillas.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="nueva-sesion-plantilla">Partir de una plantilla de sesión (opcional)</Label>
              <select
                id="nueva-sesion-plantilla"
                value={plantillaId}
                onChange={(e) => aplicarPlantilla(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
            <BloquesEjerciciosEditor bloques={bloques} onChange={setBloques} />
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
