"use client";

import { usePathname, useRouter } from "next/navigation";
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
  accionEliminar,
  useBloques,
  useDispatch,
  useFormulariosEnvios,
  useRegistrosTests,
  useSesiones,
  type Atleta,
} from "@/lib/store";

/**
 * Confirma y ejecuta el borrado en cascada de un atleta: además del propio
 * atleta, borra sus sesiones, bloques, registros de test y envíos de
 * formulario — son las únicas entidades del store que referencian
 * `atletaId` (ver CLAUDE.md > única fuente de verdad).
 */
export function EliminarAtletaDialog({
  atleta,
  open,
  onOpenChange,
}: {
  atleta: Atleta;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const dispatch = useDispatch();
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const sesiones = useSesiones();
  const bloques = useBloques();
  const registros = useRegistrosTests();
  const envios = useFormulariosEnvios();

  function confirmar() {
    sesiones
      .filter((s) => s.atletaId === atleta.id)
      .forEach((s) => dispatch(accionEliminar("sesiones", s.id)));
    bloques
      .filter((b) => b.atletaId === atleta.id)
      .forEach((b) => dispatch(accionEliminar("bloques", b.id)));
    registros
      .filter((r) => r.atletaId === atleta.id)
      .forEach((r) => dispatch(accionEliminar("registrosTests", r.id)));
    envios
      .filter((f) => f.atletaId === atleta.id)
      .forEach((f) => dispatch(accionEliminar("formulariosEnvios", f.id)));
    dispatch(accionEliminar("atletas", atleta.id));

    toast("Atleta eliminado", `${atleta.nombre} y sus datos asociados se han borrado de la demo.`);
    onOpenChange(false);
    if (pathname?.startsWith(`/atletas/${atleta.id}`)) {
      router.push("/atletas");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar a {atleta.nombre}</DialogTitle>
          <DialogDescription>
            Esta acción borra también sus sesiones, tests y formularios de la demo. No se puede
            deshacer.
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
