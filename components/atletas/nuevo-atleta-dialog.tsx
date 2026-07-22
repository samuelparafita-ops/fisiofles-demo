"use client";

import { useState, type FormEvent, type ReactNode } from "react";
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
import { accionActualizar, accionCrear, useDispatch, type Atleta, type Sexo } from "@/lib/store";

function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function inicialesDe(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Crea o edita un atleta en el store — misma UI para ambos casos: si se pasa
 * `atleta`, precarga el formulario y despacha `ACTUALIZAR`; si no, crea uno
 * nuevo con `CREAR`. Es el único punto de entrada de edición de atleta en
 * esta fase (ver CLAUDE.md > única fuente de verdad).
 */
export function NuevoAtletaDialog({
  atleta,
  trigger,
}: {
  atleta?: Atleta;
  trigger?: ReactNode;
} = {}) {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  const dispatch = useDispatch();
  const editando = Boolean(atleta);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const nombre = String(form.get("nombre") || "").trim();
    const deporte = String(form.get("deporte") || "").trim();
    const sexo = String(form.get("sexo") || "Mujer") as Sexo;
    const lesion = String(form.get("lesion") || "").trim();
    const fase = String(form.get("fase") || "").trim();

    if (atleta) {
      dispatch(accionActualizar("atletas", atleta.id, { nombre, deporte, sexo, lesion, fase }));
      toast("Atleta actualizado", `Los cambios de ${nombre} se han guardado.`);
    } else {
      const nuevoAtleta: Atleta = {
        id: `${slugify(nombre)}-${Date.now().toString(36)}`,
        nombre,
        deporte,
        sexo,
        lesion,
        fase,
        semanaProceso: 1,
        avatarInitials: inicialesDe(nombre) || "??",
        estado: "activo",
        notas: [],
        hitos: [],
        perfilFisico: [],
        acwr: [],
        evolucion: [],
      };
      dispatch(accionCrear("atletas", nuevoAtleta));
      toast("Atleta creado", `${nombre} se ha añadido a la lista de atletas.`);
    }

    e.currentTarget.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            {editando ? <Pencil className="size-4" /> : <Plus className="size-4" />}
            {editando ? "Editar" : "Nuevo atleta"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editando ? "Editar atleta" : "Nuevo atleta"}</DialogTitle>
            <DialogDescription>
              {editando
                ? "Los cambios se guardan en el store y se reflejan en toda la app."
                : "Da de alta un atleta en el proceso de readaptación."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                name="nombre"
                placeholder="Ej. Sara Molina"
                defaultValue={atleta?.nombre}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="deporte">Deporte</Label>
                <Input
                  id="deporte"
                  name="deporte"
                  placeholder="Ej. Balonmano"
                  defaultValue={atleta?.deporte}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sexo">Sexo (ref. z-score)</Label>
                <select
                  id="sexo"
                  name="sexo"
                  defaultValue={atleta?.sexo ?? "Mujer"}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="Mujer">Mujer</option>
                  <option value="Hombre">Hombre</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lesion">Lesión</Label>
              <Input
                id="lesion"
                name="lesion"
                placeholder="Ej. Tendinopatía rotuliana"
                defaultValue={atleta?.lesion}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fase">Fase del proceso</Label>
              <Input
                id="fase"
                name="fase"
                placeholder="Ej. Fase 1 · Evaluación inicial"
                defaultValue={atleta?.fase}
                required
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">{editando ? "Guardar cambios" : "Crear atleta"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
