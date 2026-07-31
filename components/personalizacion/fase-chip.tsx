"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { colorSemaforo, colorSemaforoTexto } from "@/lib/calculations";
import type { FaseLesion } from "@/lib/store";

/**
 * Chip de una fase — el color SIEMPRE se deriva de `colorSemaforo`/
 * `colorSemaforoTexto` a partir de `indice`/`total` (nunca se guarda), así que
 * añadir/quitar/reordenar una fase recalcula el degradado de TODOS los chips
 * del tipo al instante con solo volver a renderizar (ver CLAUDE.md > Lesiones,
 * fases y semáforo).
 */
export function FaseChip({
  fase,
  indice,
  total,
  puedeSubir,
  puedeBajar,
  puedeEliminar,
  onMover,
  onActualizar,
  onEliminar,
}: {
  fase: FaseLesion;
  indice: number;
  total: number;
  puedeSubir: boolean;
  puedeBajar: boolean;
  puedeEliminar: boolean;
  onMover: (dir: -1 | 1) => void;
  onActualizar: (patch: Partial<FaseLesion>) => void;
  onEliminar: () => void;
}) {
  const [open, setOpen] = useState(false);
  const colorBg = colorSemaforo(indice, total);
  const colorTexto = colorSemaforoTexto(indice, total);

  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-full border py-1 pl-1 pr-1"
      style={{ borderColor: `${colorBg}66` }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold transition-colors hover:bg-bg"
            style={{ color: colorTexto }}
          >
            <span className="size-2 shrink-0 rounded-full" style={{ background: colorBg }} />
            {fase.nombre}
            {fase.criterios && fase.criterios.length > 0 && (
              <span className="opacity-70">({fase.criterios.length})</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <EdicionFase
            fase={fase}
            puedeEliminar={puedeEliminar}
            onActualizar={onActualizar}
            onEliminar={() => {
              setOpen(false);
              onEliminar();
            }}
          />
        </PopoverContent>
      </Popover>
      <button
        type="button"
        disabled={!puedeSubir}
        onClick={() => onMover(-1)}
        aria-label={`Mover ${fase.nombre} antes`}
        className="rounded-full p-1 text-textDim transition-colors hover:bg-bg hover:text-textStrong disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronUp className="size-3" />
      </button>
      <button
        type="button"
        disabled={!puedeBajar}
        onClick={() => onMover(1)}
        aria-label={`Mover ${fase.nombre} después`}
        className="rounded-full p-1 text-textDim transition-colors hover:bg-bg hover:text-textStrong disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronDown className="size-3" />
      </button>
    </div>
  );
}

function EdicionFase({
  fase,
  puedeEliminar,
  onActualizar,
  onEliminar,
}: {
  fase: FaseLesion;
  puedeEliminar: boolean;
  onActualizar: (patch: Partial<FaseLesion>) => void;
  onEliminar: () => void;
}) {
  const [nombre, setNombre] = useState(fase.nombre);
  const [criterios, setCriterios] = useState<string[]>(fase.criterios ?? []);

  useEffect(() => {
    setNombre(fase.nombre);
    setCriterios(fase.criterios ?? []);
  }, [fase]);

  function commitNombre() {
    const v = nombre.trim();
    if (v && v !== fase.nombre) onActualizar({ nombre: v });
    else setNombre(fase.nombre);
  }

  function actualizarCriterioLocal(i: number, valor: string) {
    setCriterios((prev) => {
      const next = [...prev];
      next[i] = valor;
      return next;
    });
  }

  function commitCriterios(next: string[]) {
    setCriterios(next);
    onActualizar({ criterios: next.length > 0 ? next : undefined });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor={`nombre-fase-${fase.id}`}>Nombre de la fase</Label>
        <Input
          id={`nombre-fase-${fase.id}`}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onBlur={commitNombre}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitNombre();
            }
          }}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Criterios de progresión</Label>
        <div className="space-y-1.5">
          {criterios.map((c, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <Input
                value={c}
                placeholder="Ej. ROM completo"
                className="h-8 text-xs"
                onChange={(e) => actualizarCriterioLocal(i, e.target.value)}
                onBlur={() => commitCriterios(criterios)}
              />
              <button
                type="button"
                onClick={() => commitCriterios(criterios.filter((_, idx) => idx !== i))}
                aria-label="Quitar criterio"
                className="shrink-0 rounded-md p-1.5 text-textDim transition-colors hover:bg-bg hover:text-state-bad"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => commitCriterios([...criterios, ""])}
        >
          <Plus className="size-3.5" />
          Añadir criterio
        </Button>
      </div>

      <div className="border-t border-borderSoft pt-3">
        {puedeEliminar ? (
          <Button type="button" variant="destructive" size="sm" className="w-full" onClick={onEliminar}>
            <Trash2 className="size-3.5" />
            Eliminar fase
          </Button>
        ) : (
          <p className="text-xs text-textDim">Un tipo de lesión necesita al menos una fase.</p>
        )}
      </div>
    </div>
  );
}
