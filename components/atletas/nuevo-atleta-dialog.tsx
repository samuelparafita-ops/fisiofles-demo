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
import { FASE_OPCIONES } from "@/components/atletas/fase-utils";
import {
  accionActualizar,
  accionCrear,
  useDispatch,
  type Atleta,
  type EstadoAtleta,
  type Sexo,
} from "@/lib/store";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

const ESTADO_OPCIONES: { value: EstadoAtleta; label: string }[] = [
  { value: "activo", label: "Activo" },
  { value: "alta", label: "Alta" },
  { value: "pausa", label: "Pausa" },
];

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
  open: openProp,
  onOpenChange,
}: {
  atleta?: Atleta;
  /** `null` = sin disparador propio (diálogo controlado 100% desde fuera, ej. un menú contextual). */
  trigger?: ReactNode | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} = {}) {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = onOpenChange ?? setOpenState;
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
    const lesionDetalle = String(form.get("lesionDetalle") || "").trim();
    const fase = String(form.get("fase") || "").trim();
    const estado = String(form.get("estado") || "activo") as EstadoAtleta;
    const email = String(form.get("email") || "").trim();
    const telefono = String(form.get("telefono") || "").trim();
    const fechaNacimiento = String(form.get("fechaNacimiento") || "").trim();
    const fechaInicioTratamiento = String(form.get("fechaInicioTratamiento") || "").trim();

    const camposOpcionales = {
      lesionDetalle: lesionDetalle || undefined,
      email: email || undefined,
      telefono: telefono || undefined,
      fechaNacimiento: fechaNacimiento || undefined,
      fechaInicioTratamiento: fechaInicioTratamiento || undefined,
    };

    if (atleta) {
      dispatch(
        accionActualizar("atletas", atleta.id, {
          nombre,
          deporte,
          sexo,
          lesion,
          fase,
          estado,
          ...camposOpcionales,
        })
      );
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
        estado,
        notas: [],
        hitos: [],
        perfilFisico: [],
        acwr: [],
        evolucion: [],
        ...camposOpcionales,
      };
      dispatch(accionCrear("atletas", nuevoAtleta));
      toast("Atleta creado", `${nombre} se ha añadido a la lista de atletas.`);
    }

    e.currentTarget.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger !== null && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button>
              {editando ? <Pencil className="size-4" /> : <Plus className="size-4" />}
              {editando ? "Editar" : "Nuevo atleta"}
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editando ? "Editar atleta" : "Nuevo atleta"}</DialogTitle>
            <DialogDescription>
              {editando
                ? "Los cambios se guardan en el store y se reflejan en toda la app."
                : "Da de alta un atleta en el proceso de readaptación. Solo nombre, deporte, sexo, lesión y fase son obligatorios."}
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
                  className={selectClass}
                >
                  <option value="Mujer">Mujer</option>
                  <option value="Hombre">Hombre</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
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
                <select id="fase" name="fase" defaultValue={atleta?.fase ?? FASE_OPCIONES[0]} className={selectClass} required>
                  {FASE_OPCIONES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lesionDetalle">Detalle de la lesión (opcional)</Label>
              <textarea
                id="lesionDetalle"
                name="lesionDetalle"
                rows={2}
                placeholder="Mecanismo, diagnóstico, cirugía..."
                defaultValue={atleta?.lesionDetalle}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email (opcional)</Label>
                <Input id="email" name="email" type="email" placeholder="atleta@example.com" defaultValue={atleta?.email} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="telefono">Teléfono (opcional)</Label>
                <Input id="telefono" name="telefono" type="tel" placeholder="+34 600 000 000" defaultValue={atleta?.telefono} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="fechaNacimiento">Nacimiento (opcional)</Label>
                <Input
                  id="fechaNacimiento"
                  name="fechaNacimiento"
                  type="date"
                  defaultValue={atleta?.fechaNacimiento}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fechaInicioTratamiento">Inicio tratamiento (opcional)</Label>
                <Input
                  id="fechaInicioTratamiento"
                  name="fechaInicioTratamiento"
                  type="date"
                  defaultValue={atleta?.fechaInicioTratamiento}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="estado">Estado</Label>
              <select id="estado" name="estado" defaultValue={atleta?.estado ?? "activo"} className={selectClass}>
                {ESTADO_OPCIONES.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </select>
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
