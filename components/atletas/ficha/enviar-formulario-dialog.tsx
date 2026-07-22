"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { hoyIso } from "@/components/atletas/ficha/fecha-utils";
import { accionCrear, useDispatch, useFormulariosDef, type FormularioEnvio } from "@/lib/store";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function EnviarFormularioDialog({ atletaId }: { atletaId: string }) {
  const [open, setOpen] = useState(false);
  const [formularioId, setFormularioId] = useState("");
  const dispatch = useDispatch();
  const toast = useToast();
  const formularios = useFormulariosDef();

  function enviar() {
    const formulario = formularios.find((f) => f.id === formularioId);
    if (!formulario) return;

    const envio: FormularioEnvio = {
      id: `envio-${Date.now().toString(36)}`,
      formularioId,
      atletaId,
      fechaEnvio: hoyIso(),
      estado: "pendiente",
    };
    dispatch(accionCrear("formulariosEnvios", envio));
    toast("Formulario enviado", `${formulario.nombre} se ha enviado y queda pendiente de respuesta.`);
    setOpen(false);
    setFormularioId("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Send className="size-3.5" />
          Enviar formulario
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar formulario</DialogTitle>
          <DialogDescription>Elige un formulario predefinido para enviar al atleta.</DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-1.5">
          <Label htmlFor="formulario-select">Formulario</Label>
          <select
            id="formulario-select"
            value={formularioId}
            onChange={(e) => setFormularioId(e.target.value)}
            className={selectClass}
          >
            <option value="">Selecciona un formulario</option>
            {formularios.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nombre}
              </option>
            ))}
          </select>
          {formularioId && (
            <p className="text-xs text-textDim">
              {formularios.find((f) => f.id === formularioId)?.descripcion}
            </p>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={enviar} disabled={!formularioId}>
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
