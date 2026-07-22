"use client";

import { useState } from "react";
import { LayoutTemplate } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { hoyIso } from "@/components/atletas/ficha/fecha-utils";
import {
  accionCrear,
  generarDesdePrograma,
  generarDesdeSesion,
  useDispatch,
  usePlantillasPrograma,
  usePlantillasSesion,
} from "@/lib/store";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

type TipoPlantilla = "programa" | "sesion";

/**
 * Genera sesiones (y sus bloques semanales) a partir de una PlantillaPrograma
 * o PlantillaSesion del store, empezando en la fecha elegida. Mismas
 * entidades (`sesiones`/`bloques`) que consumen Calendario y Programación.
 */
export function AplicarPlantillaDialog({ atletaId }: { atletaId: string }) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const toast = useToast();
  const plantillasPrograma = usePlantillasPrograma();
  const plantillasSesion = usePlantillasSesion();

  const [tipo, setTipo] = useState<TipoPlantilla>("programa");
  const [plantillaId, setPlantillaId] = useState("");
  const [fechaInicio, setFechaInicio] = useState(hoyIso());

  const plantillasDisponibles = tipo === "programa" ? plantillasPrograma : plantillasSesion;

  function cambiarTipo(nuevo: TipoPlantilla) {
    setTipo(nuevo);
    setPlantillaId("");
  }

  function aplicar() {
    const plantilla = plantillasDisponibles.find((p) => p.id === plantillaId);
    if (!plantilla) return;

    if (tipo === "programa" && "semanas" in plantilla) {
      const { sesiones, bloques } = generarDesdePrograma(plantilla, atletaId, fechaInicio);
      sesiones.forEach((s) => dispatch(accionCrear("sesiones", s)));
      bloques.forEach((b) => dispatch(accionCrear("bloques", b)));
      toast(
        "Plantilla aplicada",
        `${plantilla.nombre} ha generado ${plantilla.semanas.length} semana(s) de sesiones.`
      );
    } else if (tipo === "sesion" && "ejercicios" in plantilla) {
      const { sesiones, bloques } = generarDesdeSesion(plantilla, atletaId, fechaInicio);
      sesiones.forEach((s) => dispatch(accionCrear("sesiones", s)));
      bloques.forEach((b) => dispatch(accionCrear("bloques", b)));
      toast("Plantilla aplicada", `${plantilla.nombre} se ha añadido el ${fechaInicio}.`);
    }

    setOpen(false);
    setPlantillaId("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <LayoutTemplate className="size-3.5" />
          Aplicar plantilla
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aplicar plantilla</DialogTitle>
          <DialogDescription>Genera sesiones (y bloques) a partir de una plantilla del store.</DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="flex w-fit items-center gap-0.5 rounded-lg border border-borderSoft bg-bg p-0.5">
            <button
              type="button"
              onClick={() => cambiarTipo("programa")}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                tipo === "programa" ? "bg-surface2 text-brand-ink shadow-sm" : "text-textDim"
              )}
            >
              Plantilla de programa
            </button>
            <button
              type="button"
              onClick={() => cambiarTipo("sesion")}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                tipo === "sesion" ? "bg-surface2 text-brand-ink shadow-sm" : "text-textDim"
              )}
            >
              Plantilla de sesión suelta
            </button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="plantilla-select">Plantilla</Label>
            <select
              id="plantilla-select"
              value={plantillaId}
              onChange={(e) => setPlantillaId(e.target.value)}
              className={selectClass}
            >
              <option value="">Selecciona una plantilla</option>
              {plantillasDisponibles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="plantilla-fecha">
              Fecha de inicio {tipo === "programa" && "(lunes de la semana 1)"}
            </Label>
            <Input
              id="plantilla-fecha"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={aplicar} disabled={!plantillaId}>
            Generar sesiones
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
