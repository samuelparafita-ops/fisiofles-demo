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

/**
 * No persiste nada de verdad (sin backend, ver CLAUDE.md): al enviar solo
 * muestra un toast y cierra. Vende la funcionalidad de alta de atleta sin
 * necesitar estado real.
 */
export function NuevoAtletaDialog() {
  const [open, setOpen] = useState(false);
  const toast = useToast();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const nombre = String(form.get("nombre") || "el atleta").trim();
    toast("Atleta creado (demo)", `${nombre} no se ha guardado — esto es una demo sin backend.`);
    e.currentTarget.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Nuevo atleta
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nuevo atleta</DialogTitle>
            <DialogDescription>
              Da de alta un atleta en el proceso de readaptación. Los datos de esta demo no se
              guardan.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" name="nombre" placeholder="Ej. Sara Molina" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="deporte">Deporte</Label>
                <Input id="deporte" name="deporte" placeholder="Ej. Balonmano" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sexo">Sexo (ref. z-score)</Label>
                <select
                  id="sexo"
                  name="sexo"
                  defaultValue="Mujer"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="Mujer">Mujer</option>
                  <option value="Hombre">Hombre</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lesion">Lesión</Label>
              <Input id="lesion" name="lesion" placeholder="Ej. Tendinopatía rotuliana" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fase">Fase del proceso</Label>
              <Input id="fase" name="fase" placeholder="Ej. Fase 1 · Evaluación inicial" required />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Crear atleta</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
