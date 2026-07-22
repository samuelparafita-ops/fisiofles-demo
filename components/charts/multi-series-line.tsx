"use client";

import type { ReactNode } from "react";
import {
  Area,
  ComposedChart,
  Line,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  type TooltipContentProps,
} from "recharts";
import { colors } from "@/lib/tokens";
import { useChartColors } from "@/lib/theme";
import type { PuntoSerie } from "@/lib/dashboard/series";
import { ChartPanel, LegendChip, ChartTooltipBox } from "./chart-panel";

export type AtletaSerie = { id: string; nombre: string; color: string };
type Banda = { y1: number; y2: number; color: string; opacity?: number };
type LineaReferencia = { y: number; color: string; label?: string; dashed?: boolean };

export type MultiSeriesLineProps = {
  title: string;
  description?: string;
  metric?: { value: ReactNode; label?: string };
  /** Series ya calculadas (lib/dashboard/series.ts): agregado de la plantilla + valor por atleta. */
  puntos: PuntoSerie[];
  /** Atletas superpuestos, con el color ya asignado (mismo color en las 5 métricas de la página). */
  atletas: AtletaSerie[];
  etiquetaAgregado: string;
  dominioY?: [number | string, number | string];
  bandas?: Banda[];
  lineasReferencia?: LineaReferencia[];
  formatoValor?: (n: number) => string;
  unidad?: string;
  className?: string;
};

const fmtDefecto = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

function crearTooltip(
  atletas: AtletaSerie[],
  etiquetaAgregado: string,
  formato: (n: number) => string,
  chartColorBase: string
) {
  return function MultiSeriesTooltip({ active, payload, label }: TooltipContentProps) {
    if (!active || !payload?.length) return null;
    const fila = payload[0]?.payload as Record<string, number | null> | undefined;
    if (!fila) return null;

    return (
      <ChartTooltipBox>
        <p className="mb-1 font-medium text-textStrong">{label}</p>
        <div className="space-y-0.5">
          {fila.agregado !== null && fila.agregado !== undefined && (
            <p style={{ color: chartColorBase }}>
              {etiquetaAgregado}: {formato(fila.agregado)}
            </p>
          )}
          {atletas.map((a) => {
            const valor = fila[a.id];
            return (
              <p key={a.id} style={{ color: a.color }}>
                {a.nombre}: {valor !== null && valor !== undefined ? formato(valor) : "sin datos"}
              </p>
            );
          })}
        </div>
      </ChartTooltipBox>
    );
  };
}

/**
 * Gráfico genérico "agregado + superpuestos" de /dashboard (FASE E): una
 * serie agregada de la plantilla activa (área sutil gris) con hasta 4
 * atletas superpuestos como líneas de color propio. Las 5 métricas del
 * dashboard (carga, ACWR, simetría, dolor, sesiones) reutilizan este mismo
 * componente parametrizado — ver `app/(app)/dashboard/page.tsx`.
 */
export function MultiSeriesLine({
  title,
  description,
  metric,
  puntos,
  atletas,
  etiquetaAgregado,
  dominioY = ["auto", "auto"],
  bandas,
  lineasReferencia,
  formatoValor = fmtDefecto,
  unidad,
  className,
}: MultiSeriesLineProps) {
  const chartColors = useChartColors();

  const data = puntos.map((p) => ({ semana: p.semana, agregado: p.agregado, ...p.porAtleta }));
  const TooltipContent = crearTooltip(atletas, etiquetaAgregado, formatoValor, chartColors.base);

  return (
    <ChartPanel title={title} description={description} metric={metric} className={className}>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid stroke={colors.borderSoft} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="semana"
              tick={{ fill: colors.textDim, fontSize: 11 }}
              axisLine={{ stroke: colors.borderSoft }}
              tickLine={false}
            />
            <YAxis
              domain={dominioY}
              tick={{ fill: colors.textDim, fontSize: 11 }}
              axisLine={{ stroke: colors.borderSoft }}
              tickLine={false}
              width={unidad ? 48 : 40}
              unit={unidad}
            />
            {bandas?.map((b, i) => (
              <ReferenceArea key={i} y1={b.y1} y2={b.y2} fill={b.color} fillOpacity={b.opacity ?? 0.07} />
            ))}
            {lineasReferencia?.map((l, i) => (
              <ReferenceLine
                key={i}
                y={l.y}
                stroke={l.color}
                strokeDasharray={l.dashed === false ? undefined : "4 3"}
                label={l.label ? { value: l.label, position: "insideTopLeft", fill: l.color, fontSize: 10 } : undefined}
              />
            ))}
            <Tooltip content={(props) => <TooltipContent {...props} />} cursor={{ stroke: colors.borderSoft }} />
            <Area
              dataKey="agregado"
              stroke={chartColors.base}
              fill={chartColors.base}
              fillOpacity={0.12}
              strokeWidth={2}
              connectNulls
              isAnimationActive={false}
            />
            {atletas.map((a) => (
              <Line
                key={a.id}
                dataKey={a.id}
                name={a.nombre}
                stroke={a.color}
                strokeWidth={2}
                dot={{ r: 3, fill: a.color, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                connectNulls={false}
                isAnimationActive={false}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap gap-4">
        <LegendChip color={chartColors.base} label={etiquetaAgregado} />
        {atletas.map((a) => (
          <LegendChip key={a.id} color={a.color} label={a.nombre} />
        ))}
      </div>
    </ChartPanel>
  );
}
