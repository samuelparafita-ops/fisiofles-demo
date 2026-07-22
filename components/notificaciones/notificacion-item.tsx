"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Check, Clock3, ClipboardCheck, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { colors } from "@/lib/tokens";
import { tiempoRelativo } from "@/lib/notificaciones/tiempo-relativo";
import {
  accionActualizar,
  useAtleta,
  useDispatch,
  type Notificacion,
  type SeveridadNotificacion,
  type TipoNotificacion,
} from "@/lib/store";

const ICONO_TIPO: Record<TipoNotificacion, LucideIcon> = {
  alerta: AlertTriangle,
  recordatorio: Clock3,
  tarea: ClipboardCheck,
};

const COLOR_SEVERIDAD: Record<SeveridadNotificacion, string> = {
  critico: colors.state.bad,
  atencion: colors.state.warn,
  info: colors.state.good,
};

// Notificaciones sembradas a mano no tienen `severidad` — se colorean por tipo.
const COLOR_TIPO_FALLBACK: Record<TipoNotificacion, string> = {
  alerta: colors.state.bad,
  recordatorio: colors.state.warn,
  tarea: colors.brandInk,
};

function colorDe(n: Notificacion): string {
  return n.severidad ? COLOR_SEVERIDAD[n.severidad] : COLOR_TIPO_FALLBACK[n.tipo];
}

export function NotificacionItem({ notificacion }: { notificacion: Notificacion }) {
  const dispatch = useDispatch();
  const atleta = useAtleta(notificacion.atletaId ?? "");
  const Icon = ICONO_TIPO[notificacion.tipo];
  const color = colorDe(notificacion);

  function marcarLeida() {
    dispatch(accionActualizar("notificaciones", notificacion.id, { leida: true }));
  }

  function marcarCompletada() {
    dispatch(accionActualizar("notificaciones", notificacion.id, { completada: true, leida: true }));
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-borderSoft bg-surface2 p-4 shadow-sm",
        notificacion.completada && "opacity-60"
      )}
    >
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-full"
        style={{ background: `${color}1A`, color }}
      >
        <Icon className="size-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <div className="flex min-w-0 items-center gap-2">
            {!notificacion.leida && (
              <span className="size-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
            )}
            <p className="text-sm font-semibold text-textStrong">{notificacion.titulo}</p>
          </div>
          <span className="shrink-0 text-xs text-textDim">{tiempoRelativo(notificacion.fecha)}</span>
        </div>

        <p className="mt-0.5 text-sm text-textDim">{notificacion.detalle}</p>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          {atleta && (
            <Link
              href={`/atletas/${atleta.id}`}
              className="flex items-center gap-1.5 text-xs font-medium text-brand-ink hover:underline"
            >
              <span className="flex size-5 items-center justify-center rounded-full bg-brand-tint text-[10px] font-bold text-brand-ink">
                {atleta.avatarInitials}
              </span>
              {atleta.nombre}
            </Link>
          )}

          <Link
            href={notificacion.enlace}
            className="flex items-center gap-1 text-xs font-semibold text-brand-ink hover:underline"
          >
            Ir a la tarea
            <ArrowRight className="size-3" />
          </Link>

          {!notificacion.completada && (
            <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={marcarCompletada}>
              Marcar como completada
            </Button>
          )}

          {!notificacion.leida && (
            <button
              type="button"
              onClick={marcarLeida}
              className="flex items-center gap-1 text-xs font-medium text-textDim hover:text-textStrong"
            >
              <Check className="size-3.5" />
              Marcar leída
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
