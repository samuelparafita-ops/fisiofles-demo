"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NuevoAtletaDialog } from "@/components/atletas/nuevo-atleta-dialog";
import { EliminarAtletaDialog } from "@/components/atletas/eliminar-atleta-dialog";
import type { Atleta } from "@/lib/store";

/**
 * Menú contextual "···" de editar/eliminar — compartido por la card de la
 * grid, la fila de la tabla y la cabecera de la ficha. Los diálogos de
 * edición/borrado se controlan desde fuera del menú (Radix cierra el menú
 * antes de que un `DialogTrigger` anidado pueda abrir su diálogo).
 */
export function AtletaMenu({ atleta, className }: { atleta: Atleta; className?: string }) {
  const [editando, setEditando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={className}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            aria-label={`Acciones para ${atleta.nombre}`}
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          onClick={(e) => e.stopPropagation()}
          onPointerDownCapture={(e) => e.stopPropagation()}
        >
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setEditando(true);
            }}
          >
            <Pencil className="mr-2 size-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={(e) => {
              e.preventDefault();
              setEliminando(true);
            }}
          >
            <Trash2 className="mr-2 size-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <NuevoAtletaDialog atleta={atleta} trigger={null} open={editando} onOpenChange={setEditando} />
      <EliminarAtletaDialog atleta={atleta} open={eliminando} onOpenChange={setEliminando} />
    </>
  );
}
