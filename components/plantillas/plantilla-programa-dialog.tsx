"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Plus, Pencil } from "lucide-react";
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
import { SemanasEditor } from "./semanas-editor";
import { accionActualizar, accionCrear, useDispatch, type PlantillaPrograma } from "@/lib/store";

function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Crea o edita una PlantillaPrograma — mismo patrón dual create/edit que
 * `PlantillaSesionDialog`/`NuevoAtletaDialog`.
 */
export function PlantillaProgramaDialog({
  plantilla,
  trigger,
  open: openProp,
  onOpenChange,
}: {
  plantilla?: PlantillaPrograma;
  /** `null` = sin disparador propio (diálogo controlado 100% desde fuera, ej. un menú contextual). */
  trigger?: ReactNode | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} = {}) {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = onOpenChange ?? setOpenState;
  const dispatch = useDispatch();
  const toast = useToast();
  const editando = Boolean(plantilla);

  const [nombre, setNombre] = useState(plantilla?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(plantilla?.descripcion ?? "");
  const [semanas, setSemanas] = useState<PlantillaPrograma["semanas"]>(
    plantilla?.semanas ?? [{ sesiones: [] }]
  );

  useEffect(() => {
    if (open) {
      setNombre(plantilla?.nombre ?? "");
      setDescripcion(plantilla?.descripcion ?? "");
      setSemanas(plantilla?.semanas ?? [{ sesiones: [] }]);
    }
  }, [open, plantilla]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!nombre.trim()) return;

    if (plantilla) {
      dispatch(
        accionActualizar("plantillasPrograma", plantilla.id, {
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          semanas,
        })
      );
      toast("Programa actualizado", `${nombre} se ha guardado.`);
    } else {
      const nueva: PlantillaPrograma = {
        id: `programa-${slugify(nombre)}-${Date.now().toString(36)}`,
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        semanas,
      };
      dispatch(accionCrear("plantillasPrograma", nueva));
      toast("Programa creado", `${nombre} se ha añadido a las plantillas de programa.`);
    }

    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger !== null && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button>
              {editando ? <Pencil className="size-4" /> : <Plus className="size-4" />}
              {editando ? "Editar" : "Nuevo programa"}
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editando ? "Editar plantilla de programa" : "Nueva plantilla de programa"}</DialogTitle>
            <DialogDescription>
              {editando
                ? "Los cambios se guardan en el store y se reflejan en toda la app."
                : "Sistematiza un bloque multi-semana reutilizable para aplicar a cualquier atleta."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="programa-nombre">Nombre</Label>
              <Input
                id="programa-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Post-LCA · Bloque de 4 semanas (Fase 2→3)"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="programa-descripcion">Descripción</Label>
              <textarea
                id="programa-descripcion"
                rows={2}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Progresión y objetivo general del bloque."
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Semanas ({semanas.length})</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSemanas([...semanas, { sesiones: [] }])}
                >
                  <Plus className="size-3.5" />
                  Añadir semana
                </Button>
              </div>
              <SemanasEditor semanas={semanas} onChange={setSemanas} />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!nombre.trim()}>
              {editando ? "Guardar cambios" : "Crear programa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
