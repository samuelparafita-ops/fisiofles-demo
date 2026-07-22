"use client";

import { useState } from "react";
import { CalendarRange, Copy, LayoutTemplate, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/shared/toast";
import { PlantillaProgramaDialog } from "./plantilla-programa-dialog";
import { EliminarPlantillaDialog } from "./eliminar-plantilla-dialog";
import { AplicarAAtletaDialog } from "./aplicar-a-atleta-dialog";
import { accionCrear, useDispatch, type PlantillaPrograma } from "@/lib/store";

/**
 * Card de PlantillaPrograma en la lista de /plantillas — mismo patrón de
 * menú "···" que `PlantillaSesionCard`/`AtletaMenu`.
 */
export function PlantillaProgramaCard({ plantilla }: { plantilla: PlantillaPrograma }) {
  const [editando, setEditando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [aplicando, setAplicando] = useState(false);
  const dispatch = useDispatch();
  const toast = useToast();

  const totalSesiones = plantilla.semanas.reduce((acc, s) => acc + s.sesiones.length, 0);

  function duplicar() {
    const copia: PlantillaPrograma = {
      ...plantilla,
      id: `${plantilla.id}-copia-${Date.now().toString(36)}`,
      nombre: `${plantilla.nombre} (copia)`,
    };
    dispatch(accionCrear("plantillasPrograma", copia));
    toast("Programa duplicado", `${copia.nombre} se ha creado.`);
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand-ink">
            <CalendarRange className="size-4.5" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-sm font-bold leading-snug text-textStrong">{plantilla.nombre}</p>
            <p className="mt-0.5 text-sm text-textDim">
              {plantilla.semanas.length} semana{plantilla.semanas.length === 1 ? "" : "s"} · {totalSesiones} sesión
              {totalSesiones === 1 ? "" : "es"} en total
            </p>
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

      <p className="mt-3 text-sm text-text">{plantilla.descripcion}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {plantilla.semanas.map((s, i) => (
          <span
            key={i}
            className="rounded-full border border-borderSoft bg-bg px-2 py-0.5 text-[11px] text-textDim"
          >
            S{i + 1}: {s.sesiones.length} sesión{s.sesiones.length === 1 ? "" : "es"}
          </span>
        ))}
      </div>

      <PlantillaProgramaDialog plantilla={plantilla} trigger={null} open={editando} onOpenChange={setEditando} />
      <EliminarPlantillaDialog
        id={plantilla.id}
        nombre={plantilla.nombre}
        tipo="programa"
        open={eliminando}
        onOpenChange={setEliminando}
      />
      <AplicarAAtletaDialog
        plantilla={plantilla}
        tipo="programa"
        trigger={null}
        open={aplicando}
        onOpenChange={setAplicando}
      />
    </Card>
  );
}
