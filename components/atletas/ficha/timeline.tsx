"use client";

import { useState, type FormEvent } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  ListChecks,
  Milestone,
  Plus,
  Scissors,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { accionActualizar, useDispatch, type Atleta, type TipoHito } from "@/lib/store";
import { fmtFechaLarga, hoyIso } from "@/components/atletas/ficha/fecha-utils";
import { colors } from "@/lib/tokens";

const ICONO_HITO: Record<TipoHito, LucideIcon> = {
  lesion: AlertTriangle,
  cirugia: Scissors,
  test: ListChecks,
  "cambio-fase": Milestone,
  alta: CheckCircle2,
  otro: Circle,
};

const LABEL_HITO: Record<TipoHito, string> = {
  lesion: "Lesión",
  cirugia: "Cirugía",
  test: "Test",
  "cambio-fase": "Cambio de fase",
  alta: "Alta",
  otro: "Otro",
};

// Paleta categórica de tipos de hito — siempre desde tokens (ver CLAUDE.md,
// "no hardcodees hex sueltos"). Cada valor coincide con un token existente.
const COLOR_HITO: Record<TipoHito, string> = {
  lesion: colors.state.bad,
  cirugia: colors.comparison[1],
  test: colors.dataLight.primary,
  "cambio-fase": colors.dataLight.warn,
  alta: colors.dataLight.good,
  otro: colors.dataLight.base,
};

function NuevoHitoDialog({ atleta }: { atleta: Atleta }) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const fecha = String(form.get("fecha") || hoyIso());
    const titulo = String(form.get("titulo") || "").trim();
    const tipo = String(form.get("tipo") || "otro") as TipoHito;
    const descripcion = String(form.get("descripcion") || "").trim();

    dispatch(
      accionActualizar("atletas", atleta.id, {
        hitos: [
          ...atleta.hitos,
          { id: `hito-${Date.now().toString(36)}`, fecha, titulo, tipo, descripcion: descripcion || undefined },
        ],
      })
    );
    e.currentTarget.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="size-3.5" />
          Añadir hito
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Añadir hito</DialogTitle>
            <DialogDescription>Se añade al histórico del proceso de {atleta.nombre}.</DialogDescription>
          </DialogHeader>
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="fecha">Fecha</Label>
                <Input id="fecha" name="fecha" type="date" defaultValue={hoyIso()} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tipo">Tipo</Label>
                <select
                  id="tipo"
                  name="tipo"
                  defaultValue="otro"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {(Object.keys(LABEL_HITO) as TipoHito[]).map((t) => (
                    <option key={t} value={t}>
                      {LABEL_HITO[t]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="titulo">Título</Label>
              <Input id="titulo" name="titulo" placeholder="Ej. Reevaluación de simetría" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="descripcion">Descripción (opcional)</Label>
              <textarea
                id="descripcion"
                name="descripcion"
                rows={2}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Añadir</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function Timeline({ atleta }: { atleta: Atleta }) {
  const hitos = [...atleta.hitos].sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <div className="rounded-xl border border-borderSoft bg-surface2 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-base font-bold text-textStrong">Timeline del proceso</h3>
        <NuevoHitoDialog atleta={atleta} />
      </div>

      {hitos.length === 0 ? (
        <p className="mt-4 text-sm text-textDim">Sin hitos registrados todavía.</p>
      ) : (
        <ol className="mt-5 space-y-0">
          {hitos.map((hito, i) => {
            const Icon = ICONO_HITO[hito.tipo];
            const color = COLOR_HITO[hito.tipo];
            return (
              <li key={hito.id} className="relative flex gap-3 pb-6 last:pb-0">
                {i < hitos.length - 1 && (
                  <span className="absolute left-4 top-8 h-[calc(100%-1.5rem)] w-px bg-borderSoft" />
                )}
                <div
                  className="z-10 flex size-8 shrink-0 items-center justify-center rounded-full"
                  style={{ background: `${color}1A`, color }}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <p className="text-sm font-semibold text-textStrong">{hito.titulo}</p>
                    <span className="text-xs text-textDim">{fmtFechaLarga(hito.fecha)}</span>
                  </div>
                  {hito.descripcion && (
                    <p className="mt-0.5 text-xs text-textDim">{hito.descripcion}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
