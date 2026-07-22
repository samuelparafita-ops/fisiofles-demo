"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { estadoSimetria } from "@/lib/calculations";
import { colors } from "@/lib/tokens";
import { useConfig, useResumenAtleta, type Atleta } from "@/lib/store";
import { AtletaMenu } from "@/components/atletas/atleta-menu";

const ESTADO_COLOR = {
  deficit: colors.state.bad,
  aceptable: colors.state.warn,
  optimo: colors.state.good,
} as const;

const ESTADO_ATLETA_DOT: Record<Atleta["estado"], string> = {
  activo: colors.state.good,
  alta: colors.brandInk,
  pausa: colors.state.warn,
};

const ESTADO_ATLETA_LABEL: Record<Atleta["estado"], string> = {
  activo: "Activo",
  alta: "Alta",
  pausa: "Pausa",
};

export function AtletaCard({ atleta }: { atleta: Atleta }) {
  const router = useRouter();
  const resumen = useResumenAtleta(atleta.id);
  const { umbrales } = useConfig();
  const media = resumen?.simetriaMedia ?? null;
  const estado =
    media !== null
      ? estadoSimetria(media, { aceptable: umbrales.simetriaAceptable, optimo: umbrales.simetriaObjetivo })
      : null;
  const color = estado ? ESTADO_COLOR[estado] : colors.muted;

  return (
    <Card
      onClick={() => router.push(`/atletas/${atleta.id}`)}
      className="group h-full cursor-pointer p-5 transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-tint font-display text-sm font-bold text-brand-ink transition-colors group-hover:bg-brand group-hover:text-white">
            {atleta.avatarInitials}
          </div>
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

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-textDim">Simetría media</span>
          <span className="font-display font-bold" style={{ color }}>
            {media !== null ? `${media.toFixed(0)}%` : "N/D"}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-borderSoft">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${media !== null ? Math.min(100, media) : 0}%`, background: color }}
          />
        </div>
      </div>
    </Card>
  );
}
