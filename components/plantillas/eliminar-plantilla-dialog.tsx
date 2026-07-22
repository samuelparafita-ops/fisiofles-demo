"use client";

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
import { accionEliminar, useDispatch } from "@/lib/store";

/**
 * Confirma y ejecuta el borrado de una PlantillaSesion o PlantillaPrograma.
 * Sin cascada: ninguna otra entidad referencia el id de una plantilla —
 * aplicarla solo copia sus datos en nuevas sesiones/bloques (ver
 * `lib/store/aplicar-plantilla.ts`).
 */
export function EliminarPlantillaDialog({
  id,
  nombre,
  tipo,
  open,
  onOpenChange,
}: {
  id: string;
  nombre: string;
  tipo: "sesion" | "programa";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const dispatch = useDispatch();
  const toast = useToast();

  function confirmar() {
    dispatch(accionEliminar(tipo === "sesion" ? "plantillasSesion" : "plantillasPrograma", id));
    toast(
      "Plantilla eliminada",
      `${nombre} se ha borrado de las plantillas de ${tipo === "sesion" ? "sesión" : "programa"}.`
    );
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar {nombre}</DialogTitle>
          <DialogDescription>
            Esta plantilla se borrará de la demo. No afecta a las sesiones ya generadas a partir de
            ella en atletas. No se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" variant="destructive" onClick={confirmar}>
            Eliminar definitivamente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
