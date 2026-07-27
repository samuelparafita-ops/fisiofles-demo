"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { PlantillaStats } from "@/components/clinica/plantilla-stats";
import { CalendarioRenovaciones, type Renovacion } from "@/components/clinica/calendario-renovaciones";
import { ProximasRenovaciones } from "@/components/clinica/proximas-renovaciones";
import { SaturacionEntrenadores } from "@/components/clinica/saturacion-entrenadores";
import { diasHasta } from "@/components/atletas/ficha/fecha-utils";
import { useAtletas, useEntrenadores, type Atleta, type Suscripcion } from "@/lib/store";

/** Umbral de la StatCard "Suscripciones que caducan en ≤30 días". */
const UMBRAL_CADUCA_PRONTO_DIAS = 30;

export default function ClinicaPage() {
  const atletas = useAtletas();
  const entrenadores = useEntrenadores();

  const renovaciones = useMemo<Renovacion[]>(() => {
    return atletas
      .filter((a): a is Atleta & { suscripcion: Suscripcion } => Boolean(a.suscripcion))
      .map((a) => ({
        atleta: a,
        suscripcion: a.suscripcion,
        diasRestantes: diasHasta(a.suscripcion.fechaFin),
      }))
      .sort((a, b) => a.suscripcion.fechaFin.localeCompare(b.suscripcion.fechaFin));
  }, [atletas]);

  const caducanPronto = useMemo(
    () => renovaciones.filter((r) => r.diasRestantes <= UMBRAL_CADUCA_PRONTO_DIAS).length,
    [renovaciones]
  );

  return (
    <>
      <PageHeader title="Clínica" description="Métricas y estado del negocio." />

      <PlantillaStats atletas={atletas} entrenadores={entrenadores} caducanPronto={caducanPronto} />

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CalendarioRenovaciones renovaciones={renovaciones} />
        </div>
        <div>
          <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-textDim">
            Próximas renovaciones
          </h2>
          <ProximasRenovaciones renovaciones={renovaciones} />
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-textDim">
          Saturación por entrenador
        </h2>
        <SaturacionEntrenadores entrenadores={entrenadores} atletas={atletas} />
      </div>
    </>
  );
}
