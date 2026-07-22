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
import { EjerciciosSesionEditor } from "@/components/atletas/ficha/ejercicios-sesion-editor";
import { CATEGORIAS, type Categoria } from "@/lib/mock/ejercicios";
import {
  accionActualizar,
  accionCrear,
  useDispatch,
  type EjercicioProgramado,
  type PlantillaSesion,
} from "@/lib/store";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Crea o edita una PlantillaSesion — misma UI para ambos casos, igual que
 * `NuevoAtletaDialog`: si se pasa `plantilla`, precarga y despacha
 * ACTUALIZAR; si no, crea una nueva con CREAR.
 */
export function PlantillaSesionDialog({
  plantilla,
  trigger,
  open: openProp,
  onOpenChange,
}: {
  plantilla?: PlantillaSesion;
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
  const [objetivo, setObjetivo] = useState(plantilla?.objetivo ?? "");
  const [categoria, setCategoria] = useState<Categoria>(plantilla?.categoria ?? CATEGORIAS[0]);
  const [ejercicios, setEjercicios] = useState<EjercicioProgramado[]>(plantilla?.ejercicios ?? []);

  useEffect(() => {
    if (open) {
      setNombre(plantilla?.nombre ?? "");
      setObjetivo(plantilla?.objetivo ?? "");
      setCategoria(plantilla?.categoria ?? CATEGORIAS[0]);
      setEjercicios(plantilla?.ejercicios ?? []);
    }
  }, [open, plantilla]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!nombre.trim()) return;

    if (plantilla) {
      dispatch(
        accionActualizar("plantillasSesion", plantilla.id, {
          nombre: nombre.trim(),
          objetivo: objetivo.trim(),
          categoria,
          ejercicios,
        })
      );
      toast("Plantilla actualizada", `${nombre} se ha guardado.`);
    } else {
      const nueva: PlantillaSesion = {
        id: `plantilla-${slugify(nombre)}-${Date.now().toString(36)}`,
        nombre: nombre.trim(),
        objetivo: objetivo.trim(),
        categoria,
        ejercicios,
      };
      dispatch(accionCrear("plantillasSesion", nueva));
      toast("Plantilla creada", `${nombre} se ha añadido a las plantillas de sesión.`);
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
              {editando ? "Editar" : "Nueva plantilla"}
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editando ? "Editar plantilla de sesión" : "Nueva plantilla de sesión"}</DialogTitle>
            <DialogDescription>
              {editando
                ? "Los cambios se guardan en el store y se reflejan en toda la app."
                : "Sistematiza una sesión reutilizable para aplicar a cualquier atleta."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="plantilla-nombre">Nombre</Label>
              <Input
                id="plantilla-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Fuerza tren inferior — unilateral"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plantilla-categoria">Categoría</Label>
              <select
                id="plantilla-categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as Categoria)}
                className={selectClass}
              >
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plantilla-objetivo">Objetivo</Label>
              <textarea
                id="plantilla-objetivo"
                rows={2}
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value)}
                placeholder="Ej. Fuerza unilateral de cadera y rodilla con progresión de carga."
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Ejercicios</Label>
              <EjerciciosSesionEditor ejercicios={ejercicios} onChange={setEjercicios} />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!nombre.trim()}>
              {editando ? "Guardar cambios" : "Crear plantilla"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
