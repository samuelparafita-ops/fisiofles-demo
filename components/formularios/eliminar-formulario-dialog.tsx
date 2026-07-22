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
 * Confirma y ejecuta el borrado de un FormularioDef. Sin cascada: los envíos
 * ya realizados quedan en el store pero dejan de mostrarse (referencian un
 * formularioId que ya no existe) — mismo criterio que `EliminarPlantillaDialog`.
 */
export function EliminarFormularioDialog({
  id,
  nombre,
  open,
  onOpenChange,
}: {
  id: string;
  nombre: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const dispatch = useDispatch();
  const toast = useToast();

  function confirmar() {
    dispatch(accionEliminar("formulariosDef", id));
    toast("Formulario eliminado", `${nombre} se ha borrado. Sus envíos dejan de aparecer en la actividad.`);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar {nombre}</DialogTitle>
          <DialogDescription>
            Este formulario se borrará de la demo. Los envíos ya realizados no se eliminan del
            historial del atleta, pero dejarán de mostrarse aquí. No se puede deshacer.
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
