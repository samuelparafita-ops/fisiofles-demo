"use client";

import { useState, type ReactNode } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { hoyIso } from "@/components/atletas/ficha/fecha-utils";
import { accionCrear, useAtletas, useDispatch, type FormularioDef, type FormularioEnvio } from "@/lib/store";

/**
 * Envía un FormularioDef a varios atletas a la vez — crea un FormularioEnvio
 * "pendiente" por cada uno. Si pasan 48h sin respuesta, el motor de hallazgos
 * (`lib/insights/formularios.ts`) ya genera el recordatorio correspondiente.
 */
export function EnviarFormularioADialog({
  formulario,
  trigger,
  open: openProp,
  onOpenChange,
}: {
  formulario: FormularioDef;
  /** `null` = sin disparador propio (diálogo controlado desde fuera, ej. un menú contextual). */
  trigger?: ReactNode | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = onOpenChange ?? setOpenState;
  const atletas = useAtletas();
  const dispatch = useDispatch();
  const toast = useToast();

  const [seleccionados, setSeleccionados] = useState<string[]>([]);

  function toggle(atletaId: string) {
    setSeleccionados((s) => (s.includes(atletaId) ? s.filter((id) => id !== atletaId) : [...s, atletaId]));
  }

  function enviar() {
    if (seleccionados.length === 0) return;

    seleccionados.forEach((atletaId) => {
      const envio: FormularioEnvio = {
        id: `envio-${Date.now().toString(36)}-${atletaId}`,
        formularioId: formulario.id,
        atletaId,
        fechaEnvio: hoyIso(),
        estado: "pendiente",
      };
      dispatch(accionCrear("formulariosEnvios", envio));
    });

    toast(
      "Formulario enviado",
      `${formulario.nombre} se ha enviado a ${seleccionados.length} atleta${seleccionados.length === 1 ? "" : "s"}.`
    );
    setOpen(false);
    setSeleccionados([]);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setSeleccionados([]);
      }}
    >
      {trigger !== null && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button size="sm">
              <Send className="size-3.5" />
              Enviar a…
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar &ldquo;{formulario.nombre}&rdquo;</DialogTitle>
          <DialogDescription>
            Elige a quién enviárselo. Queda pendiente de respuesta hasta que el atleta lo rellene.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 max-h-72 space-y-1 overflow-y-auto">
          {atletas.map((a) => {
            const activo = seleccionados.includes(a.id);
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => toggle(a.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left transition-colors",
                  activo ? "border-brand bg-brand-tint" : "border-transparent hover:bg-bg"
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full font-display text-xs font-bold",
                    activo ? "bg-brand text-white" : "bg-brand-tint text-brand-ink"
                  )}
                >
                  {a.avatarInitials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-textStrong">{a.nombre}</span>
                  <span className="block truncate text-xs text-textDim">{a.deporte}</span>
                </span>
                <input
                  type="checkbox"
                  checked={activo}
                  onChange={() => toggle(a.id)}
                  className="size-4 shrink-0 accent-brand"
                  aria-label={`Seleccionar ${a.nombre}`}
                />
              </button>
            );
          })}
        </div>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={enviar} disabled={seleccionados.length === 0}>
            Enviar a {seleccionados.length || ""} atleta{seleccionados.length === 1 ? "" : "s"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
