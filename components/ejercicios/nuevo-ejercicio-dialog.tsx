"use client";

import { useState, type FormEvent } from "react";
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
import { CATEGORIAS, FASES, type Categoria, type Fase } from "@/lib/mock/ejercicios";
import { accionCrear, useDispatch } from "@/lib/store";

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

export function NuevoEjercicioDialog() {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  const dispatch = useDispatch();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const nombre = String(form.get("nombre") || "").trim();
    const categoria = String(form.get("categoria") || CATEGORIAS[0]) as Categoria;
    const fase = String(form.get("fase") || FASES[0]) as Fase;
    const patron = String(form.get("patron") || "").trim();
    const material = String(form.get("material") || "").trim();

    dispatch(
      accionCrear("ejercicios", {
        id: `${slugify(nombre)}-${Date.now().toString(36)}`,
        nombre,
        categoria,
        patron,
        material,
        fasesSugeridas: [fase],
        variables: [],
        descripcion: "",
      })
    );
    toast("Ejercicio añadido", `${nombre} se ha añadido a la librería de ejercicios.`);
    e.currentTarget.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Añadir ejercicio
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nuevo ejercicio</DialogTitle>
            <DialogDescription>
              Da de alta un ejercicio en la librería. Los datos de esta demo no se guardan.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" name="nombre" placeholder="Ej. Zancada con giro de tronco" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="categoria">Categoría</Label>
                <select id="categoria" name="categoria" defaultValue={CATEGORIAS[0]} className={selectClass}>
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fase">Fase sugerida</Label>
                <select id="fase" name="fase" defaultValue={FASES[0]} className={selectClass}>
                  {FASES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="patron">Patrón de movimiento</Label>
              <Input id="patron" name="patron" placeholder="Ej. Rodilla — unilateral" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="material">Material</Label>
              <Input id="material" name="material" placeholder="Ej. Banda elástica" required />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Añadir ejercicio</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
