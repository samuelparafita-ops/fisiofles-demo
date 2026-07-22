"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { colors } from "@/lib/tokens";
import { useResumenAtleta, type Atleta } from "@/lib/store";
import { AtletaMenu } from "@/components/atletas/atleta-menu";
import type { ZonaAcwr } from "@/lib/calculations";

const ESTADO_ATLETA_LABEL: Record<Atleta["estado"], string> = {
  activo: "Activo",
  alta: "Alta",
  pausa: "Pausa",
};

const ESTADO_ATLETA_COLOR: Record<Atleta["estado"], string> = {
  activo: colors.state.good,
  alta: colors.brandInk,
  pausa: colors.state.warn,
};

const ZONA_LABEL: Record<ZonaAcwr, string> = {
  optima: "Óptima",
  riesgo: "Riesgo",
  insuficiente: "Insuf.",
};

const ZONA_COLOR: Record<ZonaAcwr, string> = {
  optima: colors.state.good,
  riesgo: colors.state.bad,
  insuficiente: colors.state.warn,
};

function FilaAtleta({ atleta }: { atleta: Atleta }) {
  const router = useRouter();
  const resumen = useResumenAtleta(atleta.id);

  return (
    <tr
      onClick={() => router.push(`/atletas/${atleta.id}`)}
      className="cursor-pointer border-b border-borderSoft transition-colors last:border-0 hover:bg-bg"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-tint font-display text-xs font-bold text-brand-ink">
            {atleta.avatarInitials}
          </div>
          <p className="font-display text-sm font-bold text-textStrong">{atleta.nombre}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-text">{atleta.deporte}</td>
      <td className="max-w-[220px] truncate px-4 py-3 text-sm text-text" title={atleta.lesion}>
        {atleta.lesion}
      </td>
      <td className="px-4 py-3">
        <Badge variant="secondary" className="truncate">
          {atleta.fase}
        </Badge>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-textDim">Sem. {atleta.semanaProceso}</td>
      <td className="px-4 py-3 text-sm font-medium text-textStrong">
        {resumen?.simetriaMedia !== null && resumen?.simetriaMedia !== undefined
          ? `${resumen.simetriaMedia.toFixed(0)}%`
          : "N/D"}
      </td>
      <td className="px-4 py-3">
        {resumen?.ratioAcwr !== null && resumen?.ratioAcwr !== undefined && resumen.zonaAcwr ? (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={{ color: ZONA_COLOR[resumen.zonaAcwr], background: `${ZONA_COLOR[resumen.zonaAcwr]}1A` }}
          >
            {resumen.ratioAcwr.toFixed(2)} · {ZONA_LABEL[resumen.zonaAcwr]}
          </span>
        ) : (
          <span className="text-xs text-textDim">N/D</span>
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
              <th className="px-4 py-3 font-medium">Simetría media</th>
              <th className="px-4 py-3 font-medium">ACWR actual</th>
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
