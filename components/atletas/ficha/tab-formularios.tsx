"use client";

import { useState } from "react";
import { ChevronDown, ClipboardList, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { fmtFechaLarga } from "@/components/atletas/ficha/fecha-utils";
import { EnviarFormularioDialog } from "@/components/atletas/ficha/enviar-formulario-dialog";
import { SimularRespuestaDialog } from "@/components/atletas/ficha/simular-respuesta-dialog";
import { useFormulariosDef, useFormulariosEnviosDeAtleta, type Atleta, type FormularioEnvio } from "@/lib/store";

function FilaEnvio({ envio }: { envio: FormularioEnvio }) {
  const formularios = useFormulariosDef();
  const formulario = formularios.find((f) => f.id === envio.formularioId);
  const [expandido, setExpandido] = useState(false);
  const [simulando, setSimulando] = useState(false);

  if (!formulario) return null;

  return (
    <div className="rounded-lg border border-borderSoft bg-bg p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-sm font-bold text-textStrong">{formulario.nombre}</p>
          <p className="text-xs text-textDim">Enviado el {fmtFechaLarga(envio.fechaEnvio)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-semibold",
              envio.estado === "respondido" ? "bg-state-good/10 text-state-good" : "bg-state-warn/10 text-state-warn"
            )}
          >
            {envio.estado === "respondido" ? "Respondido" : "Pendiente"}
          </span>
          {envio.estado === "pendiente" ? (
            <Button size="sm" variant="outline" onClick={() => setSimulando(true)}>
              <RefreshCw className="size-3.5" />
              Simular respuesta del atleta
            </Button>
          ) : (
            <button
              type="button"
              onClick={() => setExpandido((e) => !e)}
              className="flex items-center gap-1 text-xs font-medium text-brand-ink hover:underline"
            >
              Ver respuestas
              <ChevronDown className={cn("size-3.5 transition-transform", expandido && "rotate-180")} />
            </button>
          )}
        </div>
      </div>

      {envio.estado === "respondido" && expandido && envio.respuestas && (
        <div className="mt-3 space-y-1.5 border-t border-borderSoft pt-3">
          {formulario.campos.map((campo) => (
            <div key={campo.id} className="flex items-center justify-between gap-2 text-sm">
              <span className="text-textDim">{campo.etiqueta}</span>
              <span className="font-medium text-textStrong">{envio.respuestas?.[campo.id] ?? "—"}</span>
            </div>
          ))}
          {envio.fechaRespuesta && (
            <p className="pt-1 text-xs text-textDim">Respondido el {fmtFechaLarga(envio.fechaRespuesta)}</p>
          )}
        </div>
      )}

      {simulando && (
        <SimularRespuestaDialog envio={envio} formulario={formulario} onClose={() => setSimulando(false)} />
      )}
    </div>
  );
}

export function TabFormularios({ atleta }: { atleta: Atleta }) {
  const envios = useFormulariosEnviosDeAtleta(atleta.id);
  const ordenados = [...envios].sort((a, b) => b.fechaEnvio.localeCompare(a.fechaEnvio));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-base font-bold text-textStrong">Formularios</h3>
        <EnviarFormularioDialog atletaId={atleta.id} />
      </div>

      {ordenados.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Sin formularios enviados"
          description="Todavía no se ha enviado ningún formulario a este atleta."
        />
      ) : (
        <div className="space-y-3">
          {ordenados.map((envio) => (
            <FilaEnvio key={envio.id} envio={envio} />
          ))}
        </div>
      )}
    </div>
  );
}
