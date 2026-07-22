"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, ChevronDown, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtFechaLarga } from "@/components/atletas/ficha/fecha-utils";
import { SimularRespuestaDialog } from "@/components/atletas/ficha/simular-respuesta-dialog";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import {
  useAtletas,
  useFormulariosDef,
  useFormulariosEnvios,
  type Atleta,
  type FormularioDef,
  type FormularioEnvio,
} from "@/lib/store";

function FilaActividad({
  envio,
  formulario,
  atleta,
}: {
  envio: FormularioEnvio;
  formulario: FormularioDef;
  atleta: Atleta;
}) {
  const [expandido, setExpandido] = useState(false);
  const [simulando, setSimulando] = useState(false);

  return (
    <div className="rounded-lg border border-borderSoft bg-bg p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-tint font-display text-xs font-bold text-brand-ink">
            {atleta.avatarInitials}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-textStrong">
              <Link href={`/atletas/${atleta.id}`} className="hover:underline">
                {atleta.nombre}
              </Link>
              <span className="text-textDim"> · {formulario.nombre}</span>
            </p>
            <p className="text-xs text-textDim">Enviado el {fmtFechaLarga(envio.fechaEnvio)}</p>
          </div>
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

/**
 * Últimos envíos de todos los formularios, cruzando atleta + FormularioDef.
 * Reutiliza `SimularRespuestaDialog` para que "simular respuesta" aquí sea
 * exactamente el mismo flujo que en el tab Formularios de la ficha.
 */
export function ActividadReciente({ limite = 15 }: { limite?: number }) {
  const envios = useFormulariosEnvios();
  const formularios = useFormulariosDef();
  const atletas = useAtletas();

  const filas = envios
    .map((envio) => {
      const formulario = formularios.find((f) => f.id === envio.formularioId);
      const atleta = atletas.find((a) => a.id === envio.atletaId);
      return formulario && atleta ? { envio, formulario, atleta } : null;
    })
    .filter((f): f is { envio: FormularioEnvio; formulario: FormularioDef; atleta: Atleta } => Boolean(f))
    .sort((a, b) => b.envio.fechaEnvio.localeCompare(a.envio.fechaEnvio))
    .slice(0, limite);

  if (filas.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="Sin actividad todavía"
        description="Cuando envíes un formulario a un atleta, aparecerá aquí."
      />
    );
  }

  return (
    <div className="space-y-3">
      {filas.map(({ envio, formulario, atleta }) => (
        <FilaActividad key={envio.id} envio={envio} formulario={formulario} atleta={atleta} />
      ))}
    </div>
  );
}
