"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { AtletaAvatar } from "@/components/atletas/atleta-avatar";
import { AsignarEntrenadorDialog } from "@/components/atletas/asignar-entrenador-dialog";
import { Button } from "@/components/ui/button";
import { useStateColors } from "@/lib/theme";
import { estadoSaturacion } from "@/components/clinica/saturacion-utils";
import type { Atleta, Entrenador } from "@/lib/store";

function BarraOcupacion({ pct }: { pct: number }) {
  const estadoColores = useStateColors();
  const estado = estadoSaturacion(pct);
  const color = estado === "alerta" ? estadoColores.bad : estado === "atencion" ? estadoColores.warn : estadoColores.good;

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-borderSoft">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.min(100, pct)}%`, background: color }}
      />
    </div>
  );
}

function CardEntrenador({ entrenador, atletas }: { entrenador: Entrenador; atletas: Atleta[] }) {
  const router = useRouter();
  const pct = entrenador.capacidadMaxima > 0 ? (atletas.length / entrenador.capacidadMaxima) * 100 : 0;

  return (
    <div className="rounded-xl border border-borderSoft bg-surface2 p-5 shadow-sm">
      <p className="font-display text-base font-bold text-textStrong">{entrenador.nombre}</p>
      <p className="text-sm text-textDim">{entrenador.rol}</p>

      <div className="mt-3 flex items-center justify-between text-xs text-textDim">
        <span>Ocupación</span>
        <span className="font-semibold text-textStrong">
          {atletas.length}/{entrenador.capacidadMaxima} · {Math.round(pct)}%
        </span>
      </div>
      <div className="mt-1.5">
        <BarraOcupacion pct={pct} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {atletas.length === 0 ? (
          <p className="text-xs text-textDim">Sin atletas asignados.</p>
        ) : (
          atletas.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => router.push(`/atletas/${a.id}`)}
              title={a.nombre}
              className="transition-transform hover:-translate-y-0.5"
            >
              <AtletaAvatar atleta={a} size="sm" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function FilaSinAsignar({ atleta }: { atleta: Atleta }) {
  const router = useRouter();
  const [asignando, setAsignando] = useState(false);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-borderSoft bg-bg p-2.5">
      <button
        type="button"
        onClick={() => router.push(`/atletas/${atleta.id}`)}
        className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
      >
        <AtletaAvatar atleta={atleta} size="sm" />
        <span className="truncate text-sm font-medium text-textStrong">{atleta.nombre}</span>
      </button>
      <Button type="button" variant="outline" size="sm" onClick={() => setAsignando(true)}>
        Asignar
      </Button>
      <AsignarEntrenadorDialog atleta={atleta} open={asignando} onOpenChange={setAsignando} />
    </div>
  );
}

/** Bloque c) del FASE 8 — saturación por entrenador + atletas sin asignar. */
export function SaturacionEntrenadores({
  entrenadores,
  atletas,
}: {
  entrenadores: Entrenador[];
  atletas: Atleta[];
}) {
  // Los atletas de alta ya no ocupan plaza (ver lib/mock/seed.ts) y no necesitan reasignación.
  const sinAsignar = atletas.filter((a) => !a.entrenadorId && a.estado !== "alta");

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {entrenadores.map((en) => (
        <CardEntrenador key={en.id} entrenador={en} atletas={atletas.filter((a) => a.entrenadorId === en.id)} />
      ))}

      {sinAsignar.length > 0 && (
        <div className="rounded-xl border border-dashed border-border bg-surface2 p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-textDim" />
            <p className="font-display text-base font-bold text-textStrong">Sin asignar</p>
            <span className="rounded-full bg-borderSoft px-2 py-0.5 text-[11px] font-semibold text-textDim">
              {sinAsignar.length}
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {sinAsignar.map((a) => (
              <FilaSinAsignar key={a.id} atleta={a} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
