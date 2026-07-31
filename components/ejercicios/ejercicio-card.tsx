import { Dumbbell, Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Ejercicio } from "@/lib/mock/ejercicios";

const MAX_ETIQUETAS_VISIBLES = 4;

export function EjercicioCard({ ejercicio }: { ejercicio: Ejercicio }) {
  const etiquetas = ejercicio.etiquetas ?? [];
  const etiquetasVisibles = etiquetas.slice(0, MAX_ETIQUETAS_VISIBLES);
  const etiquetasOcultas = etiquetas.slice(MAX_ETIQUETAS_VISIBLES);

  return (
    <Card className="flex h-full flex-col overflow-hidden p-0">
      <div className="relative flex aspect-video shrink-0 items-center justify-center bg-slate-900">
        {ejercicio.enlaceVideo ? (
          <a
            href={ejercicio.enlaceVideo}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ver vídeo de ${ejercicio.nombre}`}
            className="flex size-11 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm transition-colors hover:bg-white/25"
          >
            <Play className="ml-0.5 size-5 fill-white text-white" />
          </a>
        ) : (
          <Dumbbell className="size-6 text-white/20" aria-hidden />
        )}
        {ejercicio.enlaceVideo && (
          <span className="absolute bottom-2 right-2 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white/80">
            Vídeo
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="font-display text-sm font-bold leading-snug text-textStrong">
            {ejercicio.nombre}
          </p>
          <Badge variant="secondary" className="shrink-0">
            {ejercicio.categoria}
          </Badge>
        </div>

        <p className="mt-1.5 text-xs text-textDim">{ejercicio.patron}</p>
        <p className="mt-2 text-xs leading-relaxed text-text">{ejercicio.descripcion}</p>

        {etiquetas.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {etiquetasVisibles.map((etiqueta) => (
              <Badge key={etiqueta} variant="outline" className="min-w-0 max-w-[130px] border-borderSoft bg-surface2">
                <span className="block truncate text-textStrong">{etiqueta}</span>
              </Badge>
            ))}
            {etiquetasOcultas.length > 0 && (
              <span
                title={etiquetasOcultas.join(", ")}
                className="rounded-full border border-borderSoft px-2 py-0.5 text-[11px] font-medium text-textDim"
              >
                +{etiquetasOcultas.length}
              </span>
            )}
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {ejercicio.fasesSugeridas.map((fase) => (
            <span
              key={fase}
              className="rounded-full border border-brand/30 bg-brand-tint px-2 py-0.5 text-[11px] font-medium text-brand-ink"
            >
              {fase}
            </span>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {ejercicio.variables.map((v) => (
            <span
              key={v}
              className="rounded-full border border-borderSoft bg-bg px-2 py-0.5 text-[11px] text-textDim"
            >
              {v}
            </span>
          ))}
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground">{ejercicio.material}</p>
      </div>
    </Card>
  );
}
