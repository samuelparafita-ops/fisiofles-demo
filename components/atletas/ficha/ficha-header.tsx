"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/stat-card";
import { AtletaMenu } from "@/components/atletas/atleta-menu";
import { useResumenAtleta, useSesionesDeAtleta, useConfig, type Atleta, type Sesion } from "@/lib/store";

const ESTADO_ATLETA_LABEL: Record<Atleta["estado"], string> = {
  activo: "Activo",
  alta: "Alta",
  pausa: "Pausa",
};

const VENTANA_ADHERENCIA_DIAS = 28;

/** % de sesiones completadas (sobre el total programado) en los últimos 28 días. */
function calcularAdherencia(sesiones: Sesion[], hoy: Date): number | null {
  const inicio = new Date(hoy);
  inicio.setDate(inicio.getDate() - (VENTANA_ADHERENCIA_DIAS - 1));

  const enVentana = sesiones.filter((s) => {
    const fecha = new Date(`${s.fecha}T00:00:00`);
    return fecha >= inicio && fecha <= hoy;
  });
  if (enVentana.length === 0) return null;

  const completadas = enVentana.filter((s) => s.estado === "completada").length;
  return (completadas / enVentana.length) * 100;
}

export function FichaHeader({ atleta }: { atleta: Atleta }) {
  const resumen = useResumenAtleta(atleta.id);
  const sesiones = useSesionesDeAtleta(atleta.id);
  const { umbrales } = useConfig();

  const hoy = useMemo(() => new Date(), []);
  const adherencia = useMemo(() => calcularAdherencia(sesiones, hoy), [sesiones, hoy]);

  const simetriaMedia = resumen?.simetriaMedia ?? null;
  const ratioAcwr = resumen?.ratioAcwr ?? null;
  const zonaAcwr = resumen?.zonaAcwr ?? null;
  const dolorActual = resumen?.dolorActual;

  return (
    <div className="mb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-brand-tint font-display text-xl font-bold text-brand-ink">
            {atleta.avatarInitials}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-textStrong">
              {atleta.nombre}
            </h1>
            <p className="mt-0.5 text-sm text-textDim">
              {atleta.deporte} · {atleta.lesion}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{atleta.fase}</Badge>
              <span className="text-xs text-muted-foreground">Semana {atleta.semanaProceso}</span>
              <span className="text-xs font-medium text-textDim">
                · {ESTADO_ATLETA_LABEL[atleta.estado]}
              </span>
            </div>
          </div>
        </div>
        <AtletaMenu atleta={atleta} className="shrink-0" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Simetría media"
          value={simetriaMedia !== null ? simetriaMedia.toFixed(0) : "N/D"}
          unit={simetriaMedia !== null ? "%" : undefined}
          variation={
            simetriaMedia !== null
              ? {
                  label:
                    simetriaMedia >= umbrales.simetriaObjetivo
                      ? "Óptimo"
                      : simetriaMedia >= umbrales.simetriaAceptable
                        ? "Aceptable"
                        : "Déficit",
                  tone:
                    simetriaMedia >= umbrales.simetriaObjetivo
                      ? "good"
                      : simetriaMedia >= umbrales.simetriaAceptable
                        ? "neutral"
                        : "bad",
                }
              : undefined
          }
        />
        <StatCard
          label="ACWR actual"
          value={ratioAcwr !== null ? ratioAcwr.toFixed(2) : "N/D"}
          unit="ratio"
          variation={
            zonaAcwr
              ? {
                  label:
                    zonaAcwr === "optima" ? "Zona óptima" : zonaAcwr === "riesgo" ? "Riesgo" : "Insuficiente",
                  tone: zonaAcwr === "optima" ? "good" : zonaAcwr === "riesgo" ? "bad" : "neutral",
                }
              : undefined
          }
        />
        <StatCard
          label="Dolor último"
          value={dolorActual ?? "N/D"}
          unit={dolorActual !== undefined ? "/10" : undefined}
          variation={
            dolorActual !== undefined
              ? {
                  label: dolorActual <= 2 ? "Leve" : dolorActual <= 5 ? "Moderado" : "Alto",
                  tone: dolorActual <= 2 ? "good" : dolorActual <= 5 ? "neutral" : "bad",
                }
              : undefined
          }
        />
        <StatCard
          label="Adherencia (4 sem.)"
          value={adherencia !== null ? adherencia.toFixed(0) : "N/D"}
          unit={adherencia !== null ? "%" : undefined}
          variation={
            adherencia !== null
              ? {
                  label: adherencia >= 80 ? "Buena" : adherencia >= 50 ? "Irregular" : "Baja",
                  tone: adherencia >= 80 ? "good" : adherencia >= 50 ? "neutral" : "bad",
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
