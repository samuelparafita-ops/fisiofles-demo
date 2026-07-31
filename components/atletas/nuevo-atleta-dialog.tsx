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
import { colorSemaforo } from "@/lib/calculations";
import {
  accionActualizar,
  accionCrear,
  useDispatch,
  useTiposLesion,
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
  const tiposLesion = useTiposLesion();
  const editando = Boolean(atleta);

  // El select de fase depende del tipo de lesión elegido (mismo modelo que el
  // filtro dependiente de /dashboard), así que el tipo sí necesita estado
  // controlado aunque el resto del formulario vaya por FormData.
  const tipoInicial =
    tiposLesion.find((t) => t.id === atleta?.lesionId)?.id ?? tiposLesion[0]?.id ?? "";
  const [lesionId, setLesionId] = useState(tipoInicial);
  const tipoSeleccionado = tiposLesion.find((t) => t.id === lesionId);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const nombre = String(form.get("nombre") || "").trim();
    const deporte = String(form.get("deporte") || "").trim();
    const sexo = String(form.get("sexo") || "Mujer") as Sexo;
    const lesion = String(form.get("lesion") || "").trim();
    const lesionDetalle = String(form.get("lesionDetalle") || "").trim();
    const faseId = String(form.get("faseId") || tipoSeleccionado?.fases[0]?.id || "").trim();
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
          lesionId,
          faseId,
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
        lesionId,
        faseId,
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
                : "Da de alta un atleta en el proceso de readaptación. Solo nombre, deporte, sexo, lesión, tipo de lesión y fase son obligatorios."}
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
            <div className="space-y-1.5">
              <Label htmlFor="lesion">Lesión (descripción del caso)</Label>
              <Input
                id="lesion"
                name="lesion"
                placeholder="Ej. Tendinopatía rotuliana bilateral"
                defaultValue={atleta?.lesion}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="lesionId">Tipo de lesión</Label>
                <select
                  id="lesionId"
                  name="lesionId"
                  value={lesionId}
                  onChange={(e) => setLesionId(e.target.value)}
                  className={selectClass}
                  required
                >
                  {tiposLesion.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="faseId">Fase del proceso</Label>
                <select
                  id="faseId"
                  name="faseId"
                  // `key` fuerza el remontaje al cambiar de tipo: si no, el
                  // select conserva el value anterior (una fase de otra lesión).
                  key={lesionId}
                  defaultValue={
                    tipoSeleccionado?.fases.some((f) => f.id === atleta?.faseId)
                      ? atleta?.faseId
                      : tipoSeleccionado?.fases[0]?.id
                  }
                  className={selectClass}
                  required
                >
                  {(tipoSeleccionado?.fases ?? []).map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nombre}
                    </option>
                  ))}
                </select>
                {tipoSeleccionado && tipoSeleccionado.fases.length > 0 && (
                  <div className="flex items-center gap-1 pt-0.5" aria-hidden>
                    {tipoSeleccionado.fases.map((f, i) => (
                      <span
                        key={f.id}
                        title={f.nombre}
                        className="h-1 flex-1 rounded-full"
                        style={{ background: colorSemaforo(i, tipoSeleccionado.fases.length) }}
                      />
                    ))}
                  </div>
                )}
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
