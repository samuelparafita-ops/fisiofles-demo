"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DIAS_SEMANA,
  totalEjerciciosSesion,
  useResumenAtleta,
  type BloqueSemanalConSesiones,
  type Sesion,
} from "@/lib/store";
import type { ZonaAcwr } from "@/lib/calculations";
import { useStateColors } from "@/lib/theme";
import { SesionDetalleCard } from "@/components/programacion/sesion-detalle-card";

const ZONA_ACWR_LABEL: Record<ZonaAcwr, string> = {
  insuficiente: "Insuficiente",
  optima: "Óptima",
  riesgo: "Riesgo",
};

function fmtFecha(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function WeekStrip({ bloque }: { bloque: BloqueSemanalConSesiones }) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
      {DIAS_SEMANA.map((dia) => {
        const sesion = bloque.sesiones.find((s) => s.dia === dia);
        return (
          <div
            key={dia}
            className={cn(
              "rounded-lg border px-2.5 py-3 text-center",
              sesion ? "border-brand/30 bg-brand-tint" : "border-borderSoft bg-bg"
            )}
          >
            <p
              className={cn(
                "text-[11px] font-semibold uppercase tracking-wide",
                sesion ? "text-brand-ink" : "text-textDim"
              )}
            >
              {dia.slice(0, 3)}
            </p>
            {sesion ? (
              <>
                <div className="mt-1 flex items-center justify-center gap-1">
                  <p className="line-clamp-2 text-xs font-medium text-textStrong">
                    {sesion.nombre}
                  </p>
                  {sesion.estado === "completada" && (
                    <CheckCircle2 className="size-3 shrink-0 text-state-good" />
                  )}
                </div>
                <p className="mt-0.5 text-[11px] text-brand-ink">
                  {sesion.estado === "cancelada" ? "Cancelada" : `${totalEjerciciosSesion(sesion)} ejerc.`}
                </p>
              </>
            ) : (
              <p className="mt-1 text-xs text-textDim">Descanso</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Cabecera extra del bloque (BLOCK OUTLINE, FASE 5): semana post-op de
 * inicio, semanas de test marcadas y el resumen de ACWR ya calculado por
 * `useResumenAtleta` (NO se recalcula nada aquí). El nº de semana del bloque
 * ya viaja dentro de `bloque.nombre` ("Semana 14 · ...", ver seed) — no se
 * duplica en un badge aparte.
 */
function CabeceraExtra({ bloque }: { bloque: BloqueSemanalConSesiones }) {
  const resumen = useResumenAtleta(bloque.atletaId);
  const estadoColores = useStateColors();

  const inicio = new Date(`${bloque.fechaInicio}T00:00:00`);
  const fin = new Date(`${bloque.fechaFin}T00:00:00`);
  const totalSemanas = Math.max(1, Math.round((fin.getTime() - inicio.getTime()) / (7 * 86400000)) + 1);
  const semanasTest = bloque.semanasTest ?? [];

  const zonaColor: Record<ZonaAcwr, string> = {
    insuficiente: estadoColores.bad,
    optima: estadoColores.good,
    riesgo: estadoColores.warn,
  };

  const hayAlgo =
    bloque.semanaPostOpInicio !== undefined || semanasTest.length > 0 || (resumen?.ratioAcwr ?? null) !== null;
  if (!hayAlgo) return null;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      {bloque.semanaPostOpInicio !== undefined && (
        <span className="rounded-full border border-borderSoft px-2 py-0.5 text-[11px] font-medium text-textDim">
          Semana {bloque.semanaPostOpInicio} post-op
        </span>
      )}
      {semanasTest.length > 0 && (
        <span className="rounded-full bg-brand-tint px-2 py-0.5 text-[11px] font-semibold text-brand-ink">
          Semana de test
          {totalSemanas > 1 && ` (semana ${semanasTest.map((i) => i + 1).join(", ")})`}
        </span>
      )}
      {resumen?.ratioAcwr !== null && resumen?.ratioAcwr !== undefined && resumen.zonaAcwr && (
        <span
          className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
          style={{ background: `${zonaColor[resumen.zonaAcwr]}1A`, color: zonaColor[resumen.zonaAcwr] }}
        >
          ACWR {resumen.ratioAcwr.toFixed(2)} · {ZONA_ACWR_LABEL[resumen.zonaAcwr]}
        </span>
      )}
    </div>
  );
}

export function ProgramacionView({
  bloque,
  defaultOpen = false,
  onEditarSesion,
}: {
  bloque: BloqueSemanalConSesiones;
  /** true = el bloque semanal arranca desplegado (la semana actual). */
  defaultOpen?: boolean;
  /** Mismo diálogo de edición que usa el tab Calendario: editar aquí es editar allí. */
  onEditarSesion?: (sesion: Sesion) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-xl border border-borderSoft bg-surface2 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 p-5 text-left"
      >
        <div>
          <p className="font-display text-base font-bold text-textStrong">{bloque.nombre}</p>
          <p className="mt-0.5 text-xs text-textDim">
            {fmtFecha(bloque.fechaInicio)} – {fmtFecha(bloque.fechaFin)}
          </p>
          <CabeceraExtra bloque={bloque} />
        </div>
        <ChevronDown className={cn("size-4 shrink-0 text-textDim transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="border-t border-borderSoft p-5 pt-5">
          <p className="max-w-2xl text-sm text-text">{bloque.objetivo}</p>

          <div className="mt-5">
            <WeekStrip bloque={bloque} />
          </div>

          <div className="mt-6 space-y-3">
            {bloque.sesiones.map((sesion) => (
              <SesionDetalleCard key={sesion.id} sesion={sesion} onEditar={onEditarSesion} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
