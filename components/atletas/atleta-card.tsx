"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { simetria, estadoSimetria } from "@/lib/calculations";
import { colors } from "@/lib/tokens";
import {
  simetriasDesdeRegistros,
  useCatalogoTests,
  useConfig,
  useRegistrosDeAtleta,
  type Atleta,
} from "@/lib/store";

const ESTADO_COLOR = {
  deficit: colors.state.bad,
  aceptable: colors.state.warn,
  optimo: colors.state.good,
} as const;

export function AtletaCard({ atleta }: { atleta: Atleta }) {
  const registros = useRegistrosDeAtleta(atleta.id);
  const catalogo = useCatalogoTests();
  const { umbrales } = useConfig();
  const simetrias = simetriasDesdeRegistros(registros, catalogo);
  const pcts = simetrias.map((s) => simetria(s.izq, s.der));
  const media = pcts.length > 0 ? pcts.reduce((a, b) => a + b, 0) / pcts.length : null;
  const estado =
    media !== null
      ? estadoSimetria(media, { aceptable: umbrales.simetriaAceptable, optimo: umbrales.simetriaObjetivo })
      : null;
  const color = estado ? ESTADO_COLOR[estado] : colors.muted;

  return (
    <Link href={`/atletas/${atleta.id}`} className="group block h-full">
      <Card className="h-full p-5 transition-all group-hover:-translate-y-0.5 group-hover:border-brand group-hover:shadow-md">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-tint font-display text-sm font-bold text-brand-ink transition-colors group-hover:bg-brand group-hover:text-white">
            {atleta.avatarInitials}
          </div>
          <div className="min-w-0">
            <p className="font-display text-base font-bold text-textStrong">{atleta.nombre}</p>
            <p className="text-sm text-muted-foreground">{atleta.deporte}</p>
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
    </Link>
  );
}
