"use client";

import { useState } from "react";
import { ChevronDown, Copy, LayoutTemplate, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/shared/toast";
import { PlantillaSesionDialog } from "./plantilla-sesion-dialog";
import { EliminarPlantillaDialog } from "./eliminar-plantilla-dialog";
import { AplicarAAtletaDialog } from "./aplicar-a-atleta-dialog";
import { accionCrear, useDispatch, useEjercicios, type PlantillaSesion } from "@/lib/store";

/**
 * Card de PlantillaSesion en la grid de /plantillas — menú "···" con
 * editar/duplicar/aplicar/eliminar, mismo patrón que `AtletaMenu` (diálogos
 * controlados desde fuera del menú porque Radix cierra el dropdown antes de
 * que un `DialogTrigger` anidado pueda abrir su diálogo).
 */
export function PlantillaSesionCard({ plantilla }: { plantilla: PlantillaSesion }) {
  const [abierta, setAbierta] = useState(false);
  const [editando, setEditando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [aplicando, setAplicando] = useState(false);
  const ejerciciosLib = useEjercicios();
  const dispatch = useDispatch();
  const toast = useToast();

  function duplicar() {
    const copia: PlantillaSesion = {
      ...plantilla,
      id: `${plantilla.id}-copia-${Date.now().toString(36)}`,
      nombre: `${plantilla.nombre} (copia)`,
    };
    dispatch(accionCrear("plantillasSesion", copia));
    toast("Plantilla duplicada", `${copia.nombre} se ha creado.`);
  }

  return (
    <Card className="flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand-ink">
            <LayoutTemplate className="size-4.5" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-sm font-bold leading-snug text-textStrong">{plantilla.nombre}</p>
            <Badge variant="secondary" className="mt-1.5">
              {plantilla.categoria}
            </Badge>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Acciones para ${plantilla.nombre}`}
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setAplicando(true)}>
              <LayoutTemplate className="mr-2 size-4" />
              Aplicar a atleta
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setEditando(true)}>
              <Pencil className="mr-2 size-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={duplicar}>
              <Copy className="mr-2 size-4" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => setEliminando(true)}
            >
              <Trash2 className="mr-2 size-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="mt-3 line-clamp-2 flex-1 text-sm text-text">{plantilla.objetivo}</p>

      <button
        type="button"
        onClick={() => setAbierta((o) => !o)}
        className="mt-4 flex items-center justify-between gap-2 rounded-md border border-borderSoft bg-bg px-3 py-2 text-left"
      >
        <span className="text-xs font-medium text-textDim">
          {plantilla.ejercicios.length} ejercicio{plantilla.ejercicios.length === 1 ? "" : "s"}
        </span>
        <ChevronDown className={cn("size-4 text-textDim transition-transform", abierta && "rotate-180")} />
      </button>

      {abierta && (
        <ul className="mt-2 space-y-1.5 border-t border-borderSoft pt-2">
          {plantilla.ejercicios.map((ej) => {
            const info = ejerciciosLib.find((e) => e.id === ej.ejercicioId);
            return (
              <li key={ej.ejercicioId} className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate text-text">{info?.nombre ?? ej.ejercicioId}</span>
                <span className="shrink-0 text-textDim">
                  {ej.series} × {ej.repeticiones}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <PlantillaSesionDialog plantilla={plantilla} trigger={null} open={editando} onOpenChange={setEditando} />
      <EliminarPlantillaDialog
        id={plantilla.id}
        nombre={plantilla.nombre}
        tipo="sesion"
        open={eliminando}
        onOpenChange={setEliminando}
      />
      <AplicarAAtletaDialog plantilla={plantilla} tipo="sesion" trigger={null} open={aplicando} onOpenChange={setAplicando} />
    </Card>
  );
}
