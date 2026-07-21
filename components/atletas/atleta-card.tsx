import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { simetria, estadoSimetria } from "@/lib/calculations";
import { colors } from "@/lib/tokens";
import type { Atleta } from "@/lib/mock/atletas";

const ESTADO_COLOR = {
  deficit: colors.state.bad,
  aceptable: colors.state.warn,
  optimo: colors.state.good,
} as const;

export function AtletaCard({ atleta }: { atleta: Atleta }) {
  const pcts = atleta.simetrias.map((s) => simetria(s.izq, s.der));
  const media = pcts.reduce((a, b) => a + b, 0) / pcts.length;
  const estado = estadoSimetria(media);
  const color = ESTADO_COLOR[estado];

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
              {media.toFixed(0)}%
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-borderSoft">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, media)}%`, background: color }}
            />
          </div>
        </div>
      </Card>
    </Link>
  );
}
