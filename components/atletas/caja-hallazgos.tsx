"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  CalendarX,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Frown,
  Scale,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { colors } from "@/lib/tokens";
import { useAtleta } from "@/lib/store";
import type { Hallazgo, SeveridadHallazgo } from "@/lib/insights";

const ORDEN_SEVERIDAD: Record<SeveridadHallazgo, number> = { critico: 0, atencion: 1, info: 2 };

const COLOR_SEVERIDAD: Record<SeveridadHallazgo, string> = {
  critico: colors.state.bad,
  atencion: colors.state.warn,
  info: colors.state.good,
};

const ICONOS_HALLAZGO: { prefijo: string; icon: LucideIcon }[] = [
  { prefijo: "hallazgo-racha-acwr-", icon: CheckCircle2 },
  { prefijo: "hallazgo-racha-simetria-", icon: CheckCircle2 },
  { prefijo: "hallazgo-acwr-", icon: Activity },
  { prefijo: "hallazgo-dolor-", icon: Frown },
  { prefijo: "hallazgo-sin-sesiones-", icon: CalendarX },
  { prefijo: "hallazgo-simetria-", icon: Scale },
  { prefijo: "hallazgo-formulario-", icon: ClipboardList },
];

function iconoDeHallazgo(id: string): LucideIcon {
  return ICONOS_HALLAZGO.find((h) => id.startsWith(h.prefijo))?.icon ?? AlertTriangle;
}

function FilaHallazgo({ hallazgo, mostrarAtleta }: { hallazgo: Hallazgo; mostrarAtleta: boolean }) {
  const atleta = useAtleta(hallazgo.atletaId);
  const Icon = iconoDeHallazgo(hallazgo.id);
  const color = COLOR_SEVERIDAD[hallazgo.severidad];

  return (
    <Link href={hallazgo.enlace} className="group flex items-start gap-3 py-3">
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-full"
        style={{ background: `${color}1A`, color }}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-textStrong group-hover:text-brand-ink">
          {mostrarAtleta ? `${atleta?.nombre ?? "Atleta"} · ${hallazgo.titulo}` : hallazgo.titulo}
        </p>
        <p className="mt-0.5 text-xs text-textDim">{hallazgo.detalle}</p>
      </div>
    </Link>
  );
}

/**
 * Caja de hallazgos reutilizada por la lista de atletas ("Hallazgos de la
 * plantilla", solo atención/crítico) y por la ficha de cada atleta (todos
 * los niveles, incluido "info"). Lenguaje siempre descriptivo — ver
 * `lib/insights`.
 */
export function CajaHallazgos({
  hallazgos,
  titulo,
  mostrarAtleta = true,
  colapsableInicial,
  vacioTitulo = "Sin hallazgos activos",
  vacioDescripcion = "No hay hallazgos que mostrar ahora mismo.",
  className,
}: {
  hallazgos: Hallazgo[];
  titulo: string;
  mostrarAtleta?: boolean;
  /** true = la caja arranca colapsada. */
  colapsableInicial?: boolean;
  vacioTitulo?: string;
  vacioDescripcion?: string;
  className?: string;
}) {
  const [colapsada, setColapsada] = useState(Boolean(colapsableInicial));

  const ordenados = [...hallazgos].sort((a, b) => {
    const porSeveridad = ORDEN_SEVERIDAD[a.severidad] - ORDEN_SEVERIDAD[b.severidad];
    if (porSeveridad !== 0) return porSeveridad;
    return b.fecha.localeCompare(a.fecha);
  });

  const tieneUrgentes = ordenados.some((h) => h.severidad !== "info");

  return (
    <div className={cn("rounded-xl border border-borderSoft bg-surface2 shadow-sm", className)}>
      <button
        type="button"
        onClick={() => setColapsada((c) => !c)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2">
          <h3 className="font-display text-base font-bold text-textStrong">{titulo}</h3>
          {ordenados.length > 0 && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-semibold",
                tieneUrgentes ? "bg-state-bad/10 text-state-bad" : "bg-state-good/10 text-state-good"
              )}
            >
              {ordenados.length}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn("size-4 shrink-0 text-textDim transition-transform", !colapsada && "rotate-180")}
        />
      </button>

      {!colapsada && (
        <div className="border-t border-borderSoft px-5 pb-2">
          {ordenados.length > 0 ? (
            <div className="divide-y divide-borderSoft">
              {ordenados.map((h) => (
                <FilaHallazgo key={h.id} hallazgo={h} mostrarAtleta={mostrarAtleta} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 text-center">
              <ShieldCheck className="mb-2 size-6 text-state-good" />
              <p className="text-sm font-medium text-textStrong">{vacioTitulo}</p>
              <p className="mt-1 text-xs text-textDim">{vacioDescripcion}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
