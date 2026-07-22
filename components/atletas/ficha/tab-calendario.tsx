"use client";

import { useMemo, useState } from "react";
import { CalendarCheck2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { useEjercicios, useSesionesDeAtleta, type Sesion } from "@/lib/store";
import { NuevaSesionDialog } from "@/components/atletas/ficha/nueva-sesion-dialog";
import { SesionDetalleDialog } from "@/components/atletas/ficha/sesion-detalle-dialog";
import { addDias, toIso } from "@/components/atletas/ficha/fecha-utils";

type Vista = "dia" | "semana" | "mes";

const VISTAS: { value: Vista; label: string }[] = [
  { value: "dia", label: "Día" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mes" },
];

const DIAS_CORTOS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const ESTADO_DOT: Record<Sesion["estado"], string> = {
  programada: "bg-brand",
  completada: "bg-state-good",
  cancelada: "bg-textDim",
};

const ESTADO_BADGE: Record<Sesion["estado"], string> = {
  programada: "bg-brand-tint text-brand-ink",
  completada: "bg-state-good/10 text-state-good",
  cancelada: "bg-borderSoft text-textDim",
};

const ESTADO_LABEL: Record<Sesion["estado"], string> = {
  programada: "Programada",
  completada: "Completada",
  cancelada: "Cancelada",
};

function inicioSemana(d: Date): Date {
  const copia = new Date(d);
  copia.setHours(0, 0, 0, 0);
  const dia = copia.getDay();
  const diff = dia === 0 ? -6 : 1 - dia;
  copia.setDate(copia.getDate() + diff);
  return copia;
}

function ChipSesion({ sesion, onClick }: { sesion: Sesion; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-1.5 rounded-md border border-borderSoft bg-surface2 px-2 py-1.5 text-left text-xs transition-colors hover:border-brand/50"
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", ESTADO_DOT[sesion.estado])} />
      <span className="truncate font-medium text-textStrong">{sesion.nombre}</span>
    </button>
  );
}

function VistaDia({
  fecha,
  sesiones,
  onSeleccionar,
}: {
  fecha: Date;
  sesiones: Sesion[];
  onSeleccionar: (s: Sesion) => void;
}) {
  const ejercicios = useEjercicios();
  const etiqueta = fecha.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="rounded-xl border border-borderSoft bg-surface2 p-5 shadow-sm">
      <p className="font-display text-base font-bold capitalize text-textStrong">{etiqueta}</p>
      {sesiones.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={CalendarCheck2}
            title="Sin sesiones este día"
            description="No hay sesiones programadas para esta fecha."
          />
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {sesiones.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSeleccionar(s)}
              className="flex w-full flex-col gap-2 rounded-lg border border-borderSoft bg-bg p-4 text-left transition-colors hover:border-brand/50"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-sm font-bold text-textStrong">{s.nombre}</p>
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", ESTADO_BADGE[s.estado])}>
                  {ESTADO_LABEL[s.estado]}
                </span>
              </div>
              <p className="text-xs text-textDim">{s.ejercicios.length} ejercicio(s)</p>
              {s.ejercicios.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {s.ejercicios.slice(0, 4).map((ej) => (
                    <span
                      key={ej.ejercicioId}
                      className="rounded-full border border-borderSoft bg-surface2 px-2 py-0.5 text-[11px] text-textDim"
                    >
                      {ejercicios.find((e) => e.id === ej.ejercicioId)?.nombre ?? ej.ejercicioId}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function VistaSemana({
  inicio,
  sesionesPorFecha,
  hoyIso,
  onSeleccionar,
}: {
  inicio: Date;
  sesionesPorFecha: Map<string, Sesion[]>;
  hoyIso: string;
  onSeleccionar: (s: Sesion) => void;
}) {
  const dias = Array.from({ length: 7 }, (_, i) => addDias(inicio, i));

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
      {dias.map((d) => {
        const iso = toIso(d);
        const esHoy = iso === hoyIso;
        const sesionesDia = sesionesPorFecha.get(iso) ?? [];
        return (
          <div
            key={iso}
            className={cn(
              "min-h-[140px] rounded-lg border p-2",
              esHoy ? "border-brand/40 bg-brand-tint/40" : "border-borderSoft bg-surface2"
            )}
          >
            <p
              className={cn(
                "text-[11px] font-semibold uppercase tracking-wide",
                esHoy ? "text-brand-ink" : "text-textDim"
              )}
            >
              {DIAS_CORTOS[d.getDay() === 0 ? 6 : d.getDay() - 1]} {d.getDate()}
            </p>
            <div className="mt-2 space-y-1.5">
              {sesionesDia.map((s) => (
                <ChipSesion key={s.id} sesion={s} onClick={() => onSeleccionar(s)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VistaMes({
  cursor,
  sesionesPorFecha,
  hoyIso,
  onDiaClick,
}: {
  cursor: Date;
  sesionesPorFecha: Map<string, Sesion[]>;
  hoyIso: string;
  onDiaClick: (iso: string) => void;
}) {
  const primerDiaMes = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const inicioGrid = inicioSemana(primerDiaMes);
  const dias = Array.from({ length: 42 }, (_, i) => addDias(inicioGrid, i));
  const mesActual = cursor.getMonth();

  return (
    <div>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-t-xl border border-b-0 border-borderSoft bg-borderSoft text-center text-[11px] font-semibold uppercase tracking-wide text-textDim">
        {DIAS_CORTOS.map((d) => (
          <div key={d} className="bg-bg py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-b-xl border border-borderSoft bg-borderSoft">
        {dias.map((d) => {
          const iso = toIso(d);
          const enMes = d.getMonth() === mesActual;
          const esHoy = iso === hoyIso;
          const sesionesDia = sesionesPorFecha.get(iso) ?? [];
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onDiaClick(iso)}
              className={cn(
                "flex min-h-[84px] flex-col items-start gap-1 bg-surface2 p-2 text-left transition-colors hover:bg-bg",
                !enMes && "opacity-40"
              )}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                  esHoy ? "bg-brand text-white" : "text-textStrong"
                )}
              >
                {d.getDate()}
              </span>
              {sesionesDia.length > 0 && (
                <span className="mt-1 rounded-full bg-brand-tint px-1.5 py-0.5 text-[10px] font-semibold text-brand-ink">
                  {sesionesDia.length} sesión{sesionesDia.length > 1 ? "es" : ""}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TabCalendario({ atletaId }: { atletaId: string }) {
  const sesiones = useSesionesDeAtleta(atletaId);
  const [vista, setVista] = useState<Vista>("semana");
  const [cursor, setCursor] = useState(() => new Date());
  const [sesionSeleccionada, setSesionSeleccionada] = useState<Sesion | null>(null);

  const sesionesPorFecha = useMemo(() => {
    const mapa = new Map<string, Sesion[]>();
    for (const s of sesiones) {
      const lista = mapa.get(s.fecha) ?? [];
      lista.push(s);
      mapa.set(s.fecha, lista);
    }
    return mapa;
  }, [sesiones]);

  function navegar(delta: number) {
    setCursor((c) => {
      if (vista === "dia") return addDias(c, delta);
      if (vista === "semana") return addDias(c, delta * 7);
      const d = new Date(c);
      d.setMonth(d.getMonth() + delta);
      return d;
    });
  }

  const cursorIso = toIso(cursor);
  const hoyIsoStr = toIso(new Date());

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-0.5 rounded-lg border border-borderSoft bg-bg p-0.5">
          {VISTAS.map((v) => (
            <button
              key={v.value}
              type="button"
              onClick={() => setVista(v.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                vista === v.value ? "bg-surface2 text-brand-ink shadow-sm" : "text-textDim hover:text-textStrong"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navegar(-1)} aria-label="Anterior">
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>
            Hoy
          </Button>
          <Button variant="outline" size="icon" onClick={() => navegar(1)} aria-label="Siguiente">
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <NuevaSesionDialog atletaId={atletaId} fechaPorDefecto={vista === "dia" ? cursorIso : undefined} />
      </div>

      {vista === "dia" && (
        <VistaDia fecha={cursor} sesiones={sesionesPorFecha.get(cursorIso) ?? []} onSeleccionar={setSesionSeleccionada} />
      )}
      {vista === "semana" && (
        <VistaSemana
          inicio={inicioSemana(cursor)}
          sesionesPorFecha={sesionesPorFecha}
          hoyIso={hoyIsoStr}
          onSeleccionar={setSesionSeleccionada}
        />
      )}
      {vista === "mes" && (
        <VistaMes
          cursor={cursor}
          sesionesPorFecha={sesionesPorFecha}
          hoyIso={hoyIsoStr}
          onDiaClick={(iso) => {
            setCursor(new Date(`${iso}T00:00:00`));
            setVista("dia");
          }}
        />
      )}

      {sesionSeleccionada && (
        <SesionDetalleDialog sesion={sesionSeleccionada} onClose={() => setSesionSeleccionada(null)} />
      )}
    </div>
  );
}
