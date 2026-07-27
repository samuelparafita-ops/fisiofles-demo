"use client";

import { StatCard } from "@/components/shared/stat-card";
import type { Atleta, Entrenador } from "@/lib/store";

/** Bloque a) del FASE 8 — StatCards de plantilla, ocupación y renovaciones próximas. */
export function PlantillaStats({
  atletas,
  entrenadores,
  caducanPronto,
}: {
  atletas: Atleta[];
  entrenadores: Entrenador[];
  caducanPronto: number;
}) {
  const activos = atletas.filter((a) => a.estado === "activo").length;
  const asignados = atletas.filter((a) => a.entrenadorId).length;
  const capacidadTotal = entrenadores.reduce((sum, e) => sum + e.capacidadMaxima, 0);
  const ocupacionPct = capacidadTotal > 0 ? Math.round((asignados / capacidadTotal) * 100) : 0;

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        label="Atletas en plantilla"
        value={atletas.length}
        variation={{ label: `${activos} activo${activos === 1 ? "" : "s"}`, tone: "neutral" }}
      />
      <StatCard
        label="Suscripciones que caducan en ≤30 días"
        value={caducanPronto}
        variation={
          caducanPronto > 0
            ? { label: "Requieren seguimiento", tone: "bad" }
            : { label: "Sin vencimientos próximos", tone: "neutral" }
        }
      />
      <StatCard
        label="Ocupación global"
        value={ocupacionPct}
        unit="%"
        variation={{ label: `${asignados}/${capacidadTotal} plazas`, tone: "neutral" }}
      />
    </div>
  );
}
