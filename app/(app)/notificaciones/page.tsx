"use client";

import { useMemo, useState } from "react";
import { Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NotificacionItem } from "@/components/notificaciones/notificacion-item";
import { addDias, hoyIso, toIso } from "@/components/atletas/ficha/fecha-utils";
import { cn } from "@/lib/utils";
import { accionActualizar, useDispatch, useNotificaciones, type Notificacion, type TipoNotificacion } from "@/lib/store";

const FILTROS: { value: "todas" | TipoNotificacion; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "alerta", label: "Alertas" },
  { value: "recordatorio", label: "Recordatorios" },
  { value: "tarea", label: "Tareas" },
];

function agrupar(notificaciones: Notificacion[]) {
  const hoy = hoyIso();
  const haceUnaSemana = toIso(addDias(new Date(), -7));
  const porFechaDesc = (a: Notificacion, b: Notificacion) => b.fecha.localeCompare(a.fecha);

  const activas = notificaciones.filter((n) => !n.completada);
  const completadas = notificaciones.filter((n) => n.completada);

  return {
    hoyGrupo: activas.filter((n) => n.fecha === hoy).sort(porFechaDesc),
    semana: activas.filter((n) => n.fecha < hoy && n.fecha > haceUnaSemana).sort(porFechaDesc),
    anteriores: activas.filter((n) => n.fecha <= haceUnaSemana).sort(porFechaDesc),
    completadas: [...completadas].sort(porFechaDesc),
  };
}

function GrupoNotificaciones({ titulo, items }: { titulo: string; items: Notificacion[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-textDim">{titulo}</h2>
      <div className="space-y-2">
        {items.map((n) => (
          <NotificacionItem key={n.id} notificacion={n} />
        ))}
      </div>
    </div>
  );
}

export default function NotificacionesPage() {
  const notificaciones = useNotificaciones();
  const dispatch = useDispatch();
  const [filtro, setFiltro] = useState<"todas" | TipoNotificacion>("todas");
  const [completadasAbiertas, setCompletadasAbiertas] = useState(false);

  const pendientes = useMemo(() => notificaciones.filter((n) => !n.leida).length, [notificaciones]);

  const filtradas = useMemo(
    () => (filtro === "todas" ? notificaciones : notificaciones.filter((n) => n.tipo === filtro)),
    [notificaciones, filtro]
  );

  const { hoyGrupo, semana, anteriores, completadas } = useMemo(() => agrupar(filtradas), [filtradas]);

  function marcarTodasLeidas() {
    for (const n of notificaciones) {
      if (!n.leida) dispatch(accionActualizar("notificaciones", n.id, { leida: true }));
    }
  }

  const sinResultados =
    hoyGrupo.length === 0 && semana.length === 0 && anteriores.length === 0 && completadas.length === 0;

  return (
    <>
      <PageHeader
        title="Notificaciones"
        description={
          pendientes > 0
            ? `${pendientes} notificación${pendientes > 1 ? "es" : ""} sin leer.`
            : "Todo al día — sin notificaciones pendientes."
        }
        actions={
          <Button variant="outline" size="sm" onClick={marcarTodasLeidas} disabled={pendientes === 0}>
            Marcar todas como leídas
          </Button>
        }
      />

      <div className="mb-6 flex w-max items-center gap-0.5 rounded-lg border border-borderSoft bg-bg p-0.5">
        {FILTROS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFiltro(f.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              filtro === f.value ? "bg-surface2 text-brand-ink shadow-sm" : "text-textDim hover:text-textStrong"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {sinResultados ? (
        <EmptyState
          icon={Bell}
          title="Sin notificaciones"
          description="No hay notificaciones que mostrar con este filtro."
        />
      ) : (
        <div className="space-y-8">
          <GrupoNotificaciones titulo="Hoy" items={hoyGrupo} />
          <GrupoNotificaciones titulo="Esta semana" items={semana} />
          <GrupoNotificaciones titulo="Anteriores" items={anteriores} />

          {completadas.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setCompletadasAbiertas((v) => !v)}
                className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-textDim"
              >
                Completadas
                <span className="rounded-full bg-borderSoft px-2 py-0.5 text-xs font-semibold text-textDim">
                  {completadas.length}
                </span>
                <ChevronDown className={cn("size-3.5 transition-transform", completadasAbiertas && "rotate-180")} />
              </button>
              {completadasAbiertas && (
                <div className="mt-3 space-y-2">
                  {completadas.map((n) => (
                    <NotificacionItem key={n.id} notificacion={n} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
