"use client";

import { useRouter } from "next/navigation";
import { CalendarClock } from "lucide-react";
import { AtletaAvatar } from "@/components/atletas/atleta-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { useStateColors } from "@/lib/theme";
import { fmtFechaLarga } from "@/components/atletas/ficha/fecha-utils";
import type { Renovacion } from "@/components/clinica/calendario-renovaciones";

const PROXIMAS_MAX = 8;
/** Mismo umbral que el calendario — vencimientos a ≤15 días se resaltan. */
const UMBRAL_PROXIMO_DIAS = 15;

/** Lista ordenada por fecha de las próximas renovaciones — bloque b) del FASE 8. */
export function ProximasRenovaciones({ renovaciones }: { renovaciones: Renovacion[] }) {
  const router = useRouter();
  const estado = useStateColors();
  const proximas = renovaciones.filter((r) => r.diasRestantes >= 0).slice(0, PROXIMAS_MAX);

  if (proximas.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="Sin renovaciones próximas"
        description="Ningún atleta tiene una suscripción que venza próximamente."
      />
    );
  }

  return (
    <div className="space-y-2">
      {proximas.map(({ atleta, suscripcion, diasRestantes }) => {
        const proximo = diasRestantes <= UMBRAL_PROXIMO_DIAS;
        return (
          <button
            key={atleta.id}
            type="button"
            onClick={() => router.push(`/atletas/${atleta.id}`)}
            className="flex w-full items-center gap-3 rounded-lg border border-borderSoft bg-surface2 p-3 text-left transition-colors hover:border-brand/50"
          >
            <AtletaAvatar atleta={atleta} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-textStrong">{atleta.nombre}</p>
              <p className="truncate text-xs text-textDim">
                {suscripcion.plan} · vence {fmtFechaLarga(suscripcion.fechaFin)}
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                !proximo && "bg-borderSoft text-textDim"
              )}
              style={proximo ? { background: `${estado.warn}1A`, color: estado.warn } : undefined}
            >
              {diasRestantes === 0 ? "Hoy" : `${diasRestantes} día${diasRestantes === 1 ? "" : "s"}`}
            </span>
          </button>
        );
      })}
    </div>
  );
}
