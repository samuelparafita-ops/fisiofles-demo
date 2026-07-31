"use client";

import { useState, type ReactNode } from "react";
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
import { cn } from "@/lib/utils";
import { useChartColors, useChartGridColors } from "@/lib/theme";
import { perfilRadar, type Capacidad, type Sexo } from "@/lib/calculations";
import { ChartPanel, LegendChip, ChartTooltipBox } from "./chart-panel";

export type RadarPerfilProps = {
  /** Valores BRUTOS por capacidad — el componente calcula el z-score, no lo recibe. */
  perfilFisico: { eje: Capacidad; inicial: number; actual: number; objetivo: number }[];
  sexo: Sexo;
  /** Si se pasa, filtra los ejes mostrados (mínimo 3 — ver selector en la ficha del atleta). Por defecto, todos. */
  ejesVisibles?: Capacidad[];
  /** Control extra en la cabecera, junto a "Comparar con inicial" (ej. selector de ejes en la ficha). */
  accionExtra?: ReactNode;
  /**
   * Versión reducida (cabecera de la ficha, FASE 4): panel más pequeño y de
   * proporción vertical — menos padding, gráfico más bajo, sin descripción,
   * leyenda ni toggle "Comparar con inicial" (ruido innecesario a ese tamaño).
   * `outerRadius` se mantiene en 55% (nota CLAUDE.md) también en este modo.
   */
  compact?: boolean;
  className?: string;
};

function fmt(n: number) {
  return n.toFixed(2);
}

function RadarTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  return (
    <ChartTooltipBox>
      <p className="mb-1 font-medium text-textStrong">{label}</p>
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
 * Por defecto solo muestra Actual vs. Objetivo; "Inicial" es opcional (toggle).
 */
export function RadarPerfil({
  perfilFisico,
  sexo,
  ejesVisibles,
  accionExtra,
  compact = false,
  className,
}: RadarPerfilProps) {
  const [compararInicial, setCompararInicial] = useState(false);
  const chartColors = useChartColors();
  const gridColors = useChartGridColors();

  const perfilFiltrado = ejesVisibles
    ? perfilFisico.filter((p) => ejesVisibles.includes(p.eje))
    : perfilFisico;

  const valoresIniciales = Object.fromEntries(
    perfilFiltrado.map((p) => [p.eje, p.inicial])
  ) as Partial<Record<Capacidad, number>>;
  const valoresActuales = Object.fromEntries(
    perfilFiltrado.map((p) => [p.eje, p.actual])
  ) as Partial<Record<Capacidad, number>>;
  const objetivoPorEje = Object.fromEntries(
    perfilFiltrado.map((p) => [p.eje, p.objetivo])
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
      description={compact ? undefined : "12 capacidades vs. población de referencia (z-score)"}
      className={cn(compact && "p-4", className)}
      action={
        <div className="flex flex-wrap items-center gap-2">
          {accionExtra}
          {!compact && (
            <button
              type="button"
              onClick={() => setCompararInicial((v) => !v)}
              className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors"
              style={{
                borderColor: compararInicial ? chartColors.base : gridColors.grid,
                color: compararInicial ? chartColors.base : gridColors.axis,
                background: compararInicial ? `${chartColors.base}14` : "transparent",
              }}
            >
              <span
                className="inline-block size-2 rounded-full"
                style={{ background: compararInicial ? chartColors.base : gridColors.line }}
              />
              Comparar con inicial
            </button>
          )}
        </div>
      }
    >
      <div className={cn("w-full", compact ? "h-56" : "h-96")}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="55%">
            <PolarGrid stroke={gridColors.grid} />
            <PolarAngleAxis
              dataKey="eje"
              tick={{ fill: gridColors.axis, fontSize: compact ? 8 : 10 }}
            />
            <PolarRadiusAxis
              domain={[-5, 3]}
              tick={{ fill: gridColors.axis, fontSize: 9 }}
              tickCount={5}
              axisLine={false}
            />
            <Tooltip content={(props) => <RadarTooltip {...props} />} />
            <Radar
              name="Media"
              dataKey="Media"
              stroke={chartColors.base}
              strokeOpacity={0.6}
              fill="transparent"
              strokeDasharray="2 3"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
            <Radar
              name="Objetivo"
              dataKey="Objetivo"
              stroke={chartColors.good}
              fill="transparent"
              strokeDasharray="3 3"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
            {compararInicial && (
              <Radar
                name="Inicial"
                dataKey="Inicial"
                stroke={chartColors.base}
                fill={chartColors.base}
                fillOpacity={0.08}
                strokeWidth={1.5}
                dot={{ r: 2, fill: chartColors.base, strokeWidth: 0 }}
              />
            )}
            <Radar
              name="Actual"
              dataKey="Actual"
              stroke={chartColors.primary}
              fill={chartColors.primary}
              fillOpacity={0.2}
              strokeWidth={2}
              dot={{ r: 3, fill: chartColors.primary, strokeWidth: 0 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      {!compact && (
        <div className="mt-3 flex flex-wrap gap-4">
          <LegendChip color={chartColors.primary} label="Actual" />
          <LegendChip color={chartColors.good} label="Objetivo RTP" dashed />
          {compararInicial && (
            <LegendChip color={chartColors.base} label="Inicial" />
          )}
        </div>
      )}
    </ChartPanel>
  );
}
