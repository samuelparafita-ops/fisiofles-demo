import { Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Ejercicio } from "@/lib/mock/ejercicios";

export function EjercicioCard({ ejercicio }: { ejercicio: Ejercicio }) {
  return (
    <Card className="flex h-full flex-col overflow-hidden p-0">
      <div className="relative flex aspect-video shrink-0 items-center justify-center bg-slate-900">
        <div className="flex size-11 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
          <Play className="ml-0.5 size-5 fill-white text-white" />
        </div>
        <span className="absolute bottom-2 right-2 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white/80">
          Vídeo
        </span>
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
