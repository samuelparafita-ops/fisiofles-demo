"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DIAS_SEMANA, type BloqueSemanalConSesiones, type Sesion } from "@/lib/store";
import { SesionAccordion } from "@/components/programacion/sesion-accordion";

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
                  {sesion.estado === "cancelada" ? "Cancelada" : `${sesion.ejercicios.length} ejerc.`}
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

export function ProgramacionView({
  bloque,
  onEditarSesion,
}: {
  bloque: BloqueSemanalConSesiones;
  /** Mismo diálogo de edición que usa el tab Calendario: editar aquí es editar allí. */
  onEditarSesion?: (sesion: Sesion) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-borderSoft bg-surface2 p-5 shadow-sm">
        <div>
          <p className="font-display text-base font-bold text-textStrong">{bloque.nombre}</p>
          <p className="mt-0.5 text-xs text-textDim">
            {fmtFecha(bloque.fechaInicio)} – {fmtFecha(bloque.fechaFin)}
          </p>
          <p className="mt-3 max-w-2xl text-sm text-text">{bloque.objetivo}</p>
        </div>

        <div className="mt-5">
          <WeekStrip bloque={bloque} />
        </div>
      </div>

      <div className="space-y-3">
        {bloque.sesiones.map((sesion, i) => (
          <SesionAccordion key={sesion.id} sesion={sesion} defaultOpen={i === 0} onEditar={onEditarSesion} />
        ))}
      </div>
    </div>
  );
}
