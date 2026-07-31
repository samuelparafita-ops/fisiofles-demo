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
import { accionCrear, useDispatch, type TipoLesion } from "@/lib/store";

function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function NuevoTipoLesionDialog() {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const toast = useToast();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const nombre = String(form.get("nombre") || "").trim();
    if (!nombre) return;

    const slug = `${slugify(nombre)}-${Date.now().toString(36)}`;
    const nuevo: TipoLesion = {
      id: slug,
      nombre,
      fases: [1, 2, 3].map((n) => ({ id: `${slug}-fase-${n}`, nombre: `Fase ${n}` })),
    };
    dispatch(accionCrear("tiposLesion", nuevo));
    toast("Tipo de lesión creado", `${nombre} se ha añadido con 3 fases genéricas para personalizar.`);
    e.currentTarget.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Plus className="size-3.5" />
          Nuevo tipo de lesión
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nuevo tipo de lesión</DialogTitle>
            <DialogDescription>
              Arranca con 3 fases genéricas renombrables — ajusta nombres y criterios después de crearlo.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-1.5">
            <Label htmlFor="nombre-tipo-lesion">Nombre</Label>
            <Input id="nombre-tipo-lesion" name="nombre" placeholder="Ej. Rotura de menisco" required autoFocus />
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Crear</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
