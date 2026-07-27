"use client";

import { useRouter } from "next/navigation";
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

function FilaAtleta({ atleta }: { atleta: Atleta }) {
  const router = useRouter();
  const entrenador = useEntrenador(atleta.entrenadorId);
  const readiness = useReadinessActual(atleta.id);
  const estado = useStateColors();
  const ESTADO_ATLETA_COLOR: Record<Atleta["estado"], string> = {
    activo: estado.good,
    alta: colors.brandInk,
    pausa: estado.warn,
  };
  const READINESS_COLOR = {
    bien: estado.good,
    atencion: estado.warn,
    alerta: estado.bad,
  } as const;

  const readinessPct = readiness !== null ? Math.round(readiness * 10) : null;
  const readinessColorValue = readinessPct !== null ? READINESS_COLOR[estadoReadiness(readinessPct)] : colors.muted;

  return (
    <tr
      onClick={() => router.push(`/atletas/${atleta.id}`)}
      className="cursor-pointer border-b border-borderSoft transition-colors last:border-0 hover:bg-bg"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <AtletaAvatar atleta={atleta} size="sm" />
          <p className="font-display text-sm font-bold text-textStrong">{atleta.nombre}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-text">{atleta.deporte}</td>
      <td className="max-w-[220px] truncate px-4 py-3 text-sm text-text" title={atleta.lesion}>
        {atleta.lesion}
      </td>
      <td className="px-4 py-3">
        <Badge variant="secondary" className="min-w-0 max-w-[160px]">
          <span className="block truncate">{atleta.fase}</span>
        </Badge>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-textDim">Sem. {atleta.semanaProceso}</td>
      <td className="px-4 py-3 text-sm font-semibold" style={{ color: readinessColorValue }}>
        {readinessPct !== null ? `${readinessPct}%` : "N/D"}
      </td>
      <td className="px-4 py-3 text-sm">
        {entrenador ? (
          <span className="text-text">{entrenador.nombre}</span>
        ) : (
          <span className="text-muted-foreground">Sin asignar</span>
        )}
      </td>
      <td className="px-4 py-3">
        <span
          className="flex w-fit items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
          style={{ background: `${ESTADO_ATLETA_COLOR[atleta.estado]}1A`, color: ESTADO_ATLETA_COLOR[atleta.estado] }}
        >
          <span className="size-1.5 rounded-full" style={{ background: ESTADO_ATLETA_COLOR[atleta.estado] }} />
          {ESTADO_ATLETA_LABEL[atleta.estado]}
        </span>
      </td>
      <td className="px-2 py-3 text-right">
        <AtletaMenu atleta={atleta} />
      </td>
    </tr>
  );
}

export function AtletasTabla({ atletas }: { atletas: Atleta[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-borderSoft bg-surface2 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-borderSoft bg-bg text-left text-xs uppercase tracking-wide text-textDim">
              <th className="px-4 py-3 font-medium">Atleta</th>
              <th className="px-4 py-3 font-medium">Deporte</th>
              <th className="px-4 py-3 font-medium">Lesión</th>
              <th className="px-4 py-3 font-medium">Fase</th>
              <th className="px-4 py-3 font-medium">Semana</th>
              <th className="px-4 py-3 font-medium">Readiness</th>
              <th className="px-4 py-3 font-medium">Entrenador</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {atletas.map((atleta) => (
              <FilaAtleta key={atleta.id} atleta={atleta} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
