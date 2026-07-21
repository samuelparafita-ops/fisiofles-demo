"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
} from "recharts";
import { colors } from "@/lib/tokens";
import { perfilRadar, type Capacidad, type Sexo } from "@/lib/calculations";
import { ChartPanel, LegendChip, ChartTooltipBox } from "./chart-panel";

export type RadarPerfilProps = {
  /** Valores BRUTOS por capacidad — el componente calcula el z-score, no lo recibe. */
  perfilFisico: { eje: Capacidad; inicial: number; actual: number; objetivo: number }[];
  sexo: Sexo;
  className?: string;
};

function fmt(n: number) {
  return n.toFixed(2);
}

function RadarTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  return (
    <ChartTooltipBox>
      <p className="mb-1 font-medium text-white">{label}</p>
      <div className="space-y-0.5">
        {payload.map((entry) => (
          <p key={entry.dataKey as string} style={{ color: entry.color }}>
            {entry.name}: {fmt(entry.value as number)}
          </p>
        ))}
      </div>
    </ChartTooltipBox>
  );
}

/**
 * Perfil físico (radar) — z-score normalizado por sexo.
 * NO recalcula nada: llama a `perfilRadar()` de `lib/calculations/radar.ts`.
 */
export function RadarPerfil({ perfilFisico, sexo, className }: RadarPerfilProps) {
  const valoresIniciales = Object.fromEntries(
    perfilFisico.map((p) => [p.eje, p.inicial])
  ) as Partial<Record<Capacidad, number>>;
  const valoresActuales = Object.fromEntries(
    perfilFisico.map((p) => [p.eje, p.actual])
  ) as Partial<Record<Capacidad, number>>;
  const objetivoPorEje = Object.fromEntries(
    perfilFisico.map((p) => [p.eje, p.objetivo])
  ) as Record<Capacidad, number>;

  const series = perfilRadar(valoresIniciales, valoresActuales, sexo);
  const data = series.map((s) => ({
    eje: s.eje,
    Inicial: s.inicial,
    Actual: s.actual,
    Media: s.base,
    Objetivo: objetivoPorEje[s.eje],
  }));

  return (
    <ChartPanel
      title="Perfil físico"
      description="12 capacidades vs. población de referencia (z-score)"
      className={className}
    >
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="70%">
            <PolarGrid stroke={colors.chartGrid} />
            <PolarAngleAxis
              dataKey="eje"
              tick={{ fill: colors.chartText, fontSize: 10 }}
            />
            <PolarRadiusAxis
              domain={[-5, 3]}
              tick={{ fill: colors.chartText, fontSize: 9 }}
              tickCount={5}
              axisLine={false}
            />
            <Tooltip content={(props) => <RadarTooltip {...props} />} />
            <Radar
              name="Media"
              dataKey="Media"
              stroke={colors.data.base}
              fill="transparent"
              strokeDasharray="4 3"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
            <Radar
              name="Objetivo"
              dataKey="Objetivo"
              stroke={colors.data.good}
              fill="transparent"
              strokeDasharray="3 3"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
            <Radar
              name="Inicial"
              dataKey="Inicial"
              stroke={colors.data.base}
              fill={colors.data.base}
              fillOpacity={0.08}
              strokeWidth={1.5}
              dot={{ r: 2, fill: colors.data.base, strokeWidth: 0 }}
            />
            <Radar
              name="Actual"
              dataKey="Actual"
              stroke={colors.data.primary}
              fill={colors.data.primary}
              fillOpacity={0.25}
              strokeWidth={2}
              dot={{ r: 3, fill: colors.data.primary, strokeWidth: 0 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap gap-4">
        <LegendChip color={colors.data.base} label="Inicial" />
        <LegendChip color={colors.data.primary} label="Actual" />
        <LegendChip color={colors.data.base} label="Media (z=0)" dashed />
        <LegendChip color={colors.data.good} label="Objetivo RTP" dashed />
      </div>
    </ChartPanel>
  );
}
