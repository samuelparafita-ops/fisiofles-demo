"use client";

import { useState, type ReactNode } from "react";
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
import { hoyIso } from "@/components/atletas/ficha/fecha-utils";
import {
  accionCrear,
  generarDesdePrograma,
  generarDesdeSesion,
  useAtletas,
  useDispatch,
  type PlantillaPrograma,
  type PlantillaSesion,
} from "@/lib/store";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

/**
 * Aplica una PlantillaPrograma o PlantillaSesion a un atleta elegido en el
 * momento (a diferencia de `AplicarPlantillaDialog`, que vive en la ficha y
 * ya conoce el atletaId). Misma generación (`lib/store/aplicar-plantilla.ts`),
 * mismas entidades resultantes — ver CLAUDE.md > única fuente de verdad.
 */
export function AplicarAAtletaDialog({
  plantilla,
  tipo,
  trigger,
  open: openProp,
  onOpenChange,
}: {
  plantilla: PlantillaPrograma | PlantillaSesion;
  tipo: "programa" | "sesion";
  trigger?: ReactNode | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = onOpenChange ?? setOpenState;
  const atletas = useAtletas();
  const dispatch = useDispatch();
  const toast = useToast();

  const [atletaId, setAtletaId] = useState("");
  const [fechaInicio, setFechaInicio] = useState(hoyIso());

  function aplicar() {
    if (!atletaId) return;
    const { sesiones, bloques } =
      tipo === "programa"
        ? generarDesdePrograma(plantilla as PlantillaPrograma, atletaId, fechaInicio)
        : generarDesdeSesion(plantilla as PlantillaSesion, atletaId, fechaInicio);

    sesiones.forEach((s) => dispatch(accionCrear("sesiones", s)));
    bloques.forEach((b) => dispatch(accionCrear("bloques", b)));

    const atleta = atletas.find((a) => a.id === atletaId);
    toast("Plantilla aplicada", `${plantilla.nombre} se ha aplicado a ${atleta?.nombre ?? "el atleta"}.`);
    setOpen(false);
    setAtletaId("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger !== null && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button size="sm" variant="outline">
              <LayoutTemplate className="size-3.5" />
              Aplicar a atleta
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aplicar &ldquo;{plantilla.nombre}&rdquo;</DialogTitle>
          <DialogDescription>
            Genera sesiones (y bloques semanales) en el calendario del atleta elegido.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="aplicar-atleta">Atleta</Label>
            <select
              id="aplicar-atleta"
              value={atletaId}
              onChange={(e) => setAtletaId(e.target.value)}
              className={selectClass}
            >
              <option value="">Selecciona un atleta</option>
              {atletas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="aplicar-fecha">
              Fecha de inicio {tipo === "programa" && "(lunes de la semana 1)"}
            </Label>
            <Input
              id="aplicar-fecha"
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
          <Button type="button" onClick={aplicar} disabled={!atletaId}>
            Generar sesiones
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
