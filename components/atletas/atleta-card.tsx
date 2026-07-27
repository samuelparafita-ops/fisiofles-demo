"use client";

import { useRouter } from "next/navigation";
import { UserCog } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { colors } from "@/lib/tokens";
import { useStateColors } from "@/lib/theme";
import { useEntrenador, useReadinessActual, type Atleta } from "@/lib/store";
import { AtletaAvatar } from "@/components/atletas/atleta-avatar";
import { AtletaMenu } from "@/components/atletas/atleta-menu";
import { estadoReadiness } from "@/components/atletas/readiness-utils";

const ESTADO_ATLETA_LABEL: Record<Atleta["estado"], string> = {
  activo: "Activo",
  alta: "Alta",
  pausa: "Pausa",
};

export function AtletaCard({ atleta }: { atleta: Atleta }) {
  const router = useRouter();
  const entrenador = useEntrenador(atleta.entrenadorId);
  const readiness = useReadinessActual(atleta.id);
  const estadoColores = useStateColors();
  const ESTADO_ATLETA_DOT: Record<Atleta["estado"], string> = {
    activo: estadoColores.good,
    alta: colors.brandInk,
    pausa: estadoColores.warn,
  };
  const READINESS_COLOR = {
    bien: estadoColores.good,
    atencion: estadoColores.warn,
    alerta: estadoColores.bad,
  } as const;

  const readinessPct = readiness !== null ? Math.round(readiness * 10) : null;
  const color = readinessPct !== null ? READINESS_COLOR[estadoReadiness(readinessPct)] : colors.muted;

  return (
    <Card
      onClick={() => router.push(`/atletas/${atleta.id}`)}
      className="group h-full cursor-pointer p-5 transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-3">
          <AtletaAvatar
            atleta={atleta}
            size="md"
            className="transition-colors group-hover:bg-brand group-hover:text-white"
          />
          <div className="min-w-0">
            <p className="font-display text-base font-bold text-textStrong">{atleta.nombre}</p>
            <p className="text-sm text-muted-foreground">{atleta.deporte}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span
            className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
            style={{ background: `${ESTADO_ATLETA_DOT[atleta.estado]}1A`, color: ESTADO_ATLETA_DOT[atleta.estado] }}
          >
            <span
              className="size-1.5 rounded-full"
              style={{ background: ESTADO_ATLETA_DOT[atleta.estado] }}
            />
            {ESTADO_ATLETA_LABEL[atleta.estado]}
          </span>
          <AtletaMenu atleta={atleta} />
        </div>
      </div>

      <p className="mt-4 line-clamp-1 text-sm text-text">{atleta.lesion}</p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <Badge variant="secondary" className="truncate">
          {atleta.fase}
        </Badge>
        <span className="shrink-0 text-xs text-muted-foreground">
          Semana {atleta.semanaProceso}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-textDim">
        <UserCog className="size-3.5 shrink-0" />
        {entrenador ? (
          <span className="truncate text-text">{entrenador.nombre}</span>
        ) : (
          <span>Sin asignar</span>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-textDim">Readiness</span>
          <span className="font-display font-bold" style={{ color }}>
            {readinessPct !== null ? `${readinessPct}%` : "N/D"}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-borderSoft">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${readinessPct !== null ? Math.min(100, readinessPct) : 0}%`, background: color }}
          />
        </div>
      </div>
    </Card>
  );
}
