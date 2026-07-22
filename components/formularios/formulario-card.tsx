"use client";

import { useState } from "react";
import { ClipboardList, Copy, MoreVertical, Pencil, Send, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/shared/toast";
import { FormularioDefDialog } from "@/components/formularios/formulario-def-dialog";
import { EliminarFormularioDialog } from "@/components/formularios/eliminar-formulario-dialog";
import { EnviarFormularioADialog } from "@/components/formularios/enviar-formulario-a-dialog";
import { accionCrear, useDispatch, useFormulariosEnvios, type FormularioDef } from "@/lib/store";

/**
 * Card de FormularioDef en "Mis formularios" — menú "···" con
 * editar/duplicar/eliminar, mismo patrón que `PlantillaSesionCard`.
 */
export function FormularioCard({ formulario }: { formulario: FormularioDef }) {
  const [editando, setEditando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const envios = useFormulariosEnvios();
  const dispatch = useDispatch();
  const toast = useToast();

  const nEnvios = envios.filter((e) => e.formularioId === formulario.id).length;

  function duplicar() {
    const copia: FormularioDef = {
      ...formulario,
      id: `${formulario.id}-copia-${Date.now().toString(36)}`,
      nombre: `${formulario.nombre} (copia)`,
    };
    dispatch(accionCrear("formulariosDef", copia));
    toast("Formulario duplicado", `${copia.nombre} se ha creado.`);
  }

  return (
    <Card className="flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand-ink">
            <ClipboardList className="size-4.5" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-sm font-bold leading-snug text-textStrong">{formulario.nombre}</p>
            {formulario.testDefId && (
              <Badge variant="secondary" className="mt-1.5">
                Vinculado a test PRO
              </Badge>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Acciones para ${formulario.nombre}`}
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setEnviando(true)}>
              <Send className="mr-2 size-4" />
              Enviar
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

      <p className="mt-3 line-clamp-2 flex-1 text-sm text-text">{formulario.descripcion}</p>

      <div className="mt-4 flex items-center justify-between gap-2 text-xs text-textDim">
        <span>
          {formulario.campos.length} campo{formulario.campos.length === 1 ? "" : "s"}
        </span>
        <span>
          {nEnvios} envío{nEnvios === 1 ? "" : "s"}
        </span>
      </div>

      <Button size="sm" className="mt-4" onClick={() => setEnviando(true)}>
        <Send className="size-3.5" />
        Enviar a…
      </Button>

      <FormularioDefDialog formulario={formulario} trigger={null} open={editando} onOpenChange={setEditando} />
      <EliminarFormularioDialog
        id={formulario.id}
        nombre={formulario.nombre}
        open={eliminando}
        onOpenChange={setEliminando}
      />
      <EnviarFormularioADialog
        formulario={formulario}
        trigger={null}
        open={enviando}
        onOpenChange={setEnviando}
      />
    </Card>
  );
}
