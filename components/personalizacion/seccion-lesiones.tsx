"use client";

import { useMemo } from "react";
import { SeccionCard } from "./seccion-card";
import { TipoLesionCard } from "./tipo-lesion-card";
import { NuevoTipoLesionDialog } from "./nuevo-tipo-lesion-dialog";
import { useTiposLesion } from "@/lib/store";

/**
 * "Lesiones y fases" — el criterio profesional en estado puro (keypoint del
 * cliente: cada fisio tiene su propio método, la app nunca lo impone). Base de
 * la que dependen dashboard (FASE 3), ficha (FASE 4) y programación (FASE 5).
 */
export function SeccionLesiones() {
  const tiposLesion = useTiposLesion();

  const { normales, rendimiento } = useMemo(() => {
    const rendimiento = tiposLesion.find((t) => t.esRendimiento);
    const normales = tiposLesion.filter((t) => !t.esRendimiento);
    return { normales, rendimiento };
  }, [tiposLesion]);

  return (
    <SeccionCard
      id="lesiones-fases"
      title="Lesiones y fases"
      description="Define tus propios tipos de lesión y las fases de su proceso — el orden de las fases es el orden del semáforo."
    >
      <div className="mb-4 rounded-lg border border-borderSoft bg-bg px-4 py-3 text-xs text-textDim">
        Las etiquetas de ejercicios se crean desde cada ejercicio y aparecen en los filtros automáticamente — no hay
        un catálogo cerrado que gestionar aquí.
      </div>

      <div className="space-y-3">
        {normales.map((tipo) => (
          <TipoLesionCard key={tipo.id} tipo={tipo} />
        ))}
      </div>

      <div className="mt-4">
        <NuevoTipoLesionDialog />
      </div>

      {rendimiento && (
        <div className="mt-6 border-t border-borderSoft pt-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-textDim">Tipo especial</p>
          <TipoLesionCard tipo={rendimiento} />
        </div>
      )}
    </SeccionCard>
  );
}
