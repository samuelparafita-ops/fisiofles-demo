"use client";

import type { ReactNode } from "react";
import {
  Bar,
  ComposedChart,
  Line,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  type TooltipContentProps,
} from "recharts";
import { useChartColors, useChartGridColors } from "@/lib/theme";
import type { PuntoSerie } from "@/lib/dashboard/series";
import type { AtletaSerie } from "./multi-series-line";
import { ChartPanel, LegendChip, ChartTooltipBox } from "./chart-panel";

export type BarrasTemporalProps = {
  titulo: string;
  descripcion?: string;
  /** Serie semanal ya calculada (`lib/dashboard/series-tests.ts` → `serieTest`). */
  puntos: PuntoSerie[];
  /** Atletas superpuestos como línea, con color ya asignado — sin tope (ver `useComparisonColorsExtended()`). */
  atletas: AtletaSerie[];
  etiquetaAgregado: string;
  unidad?: string;
  formatoValor?: (n: number) => string;
  lineaReferencia?: { valor: number; etiqueta?: string };
  action?: ReactNode;
  className?: string;
};

const fmtDefecto = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

function crearTooltip(
  atletas: AtletaSerie[],
  etiquetaAgregado: string,
  formato: (n: number) => string,
  chartColorBase: string
) {
  return function BarrasTemporalTooltip({ active, payload, label }: TooltipContentProps) {
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
 * Barras por semana del agregado del equipo, con overlay de líneas de
 * atletas (sin tope) — usada por `GraficoTest` en modo "Evolución". Mismo
 * patrón visual que `MultiSeriesLine` (dashboard v2 FASE E), pero el agregado
 * se pinta en barras en vez de área, porque aquí la serie no es continua
 * semana a semana (viene interpolada entre registros de test reales, no
 * medida cada semana).
 */
export function BarrasTemporal({
  titulo,
  descripcion,
  puntos,
  atletas,
  etiquetaAgregado,
  unidad,
  formatoValor = fmtDefecto,
  lineaReferencia,
  action,
  className,
}: BarrasTemporalProps) {
  const chartColors = useChartColors();
  const gridColors = useChartGridColors();

  const data = puntos.map((p) => ({ semana: p.semana, agregado: p.agregado, ...p.porAtleta }));
  const TooltipContent = crearTooltip(atletas, etiquetaAgregado, formatoValor, chartColors.base);

  const sinDatos = puntos.every(
    (p) => p.agregado === null && Object.values(p.porAtleta).every((v) => v === null)
  );
  if (sinDatos) {
    return (
      <ChartPanel title={titulo} description={descripcion} action={action} className={className}>
        <p className="py-10 text-center text-sm text-textDim">Sin registros en el periodo seleccionado.</p>
      </ChartPanel>
    );
  }

  return (
    <ChartPanel title={titulo} description={descripcion} action={action} className={className}>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid stroke={gridColors.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="semana"
              tick={{ fill: gridColors.axis, fontSize: 11 }}
              axisLine={{ stroke: gridColors.grid }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: gridColors.axis, fontSize: 11 }}
              axisLine={{ stroke: gridColors.grid }}
              tickLine={false}
              width={unidad ? 48 : 40}
              unit={unidad}
            />
            {lineaReferencia && (
              <ReferenceLine
                y={lineaReferencia.valor}
                stroke={chartColors.primary}
                strokeDasharray="4 3"
                label={
                  lineaReferencia.etiqueta
                    ? { value: lineaReferencia.etiqueta, position: "insideTopLeft", fill: chartColors.primary, fontSize: 10 }
                    : undefined
                }
              />
            )}
            <Tooltip content={(props) => <TooltipContent {...props} />} cursor={{ fill: gridColors.cursor, opacity: 0.5 }} />
            <Bar dataKey="agregado" fill={chartColors.base} fillOpacity={0.35} radius={[3, 3, 0, 0]} isAnimationActive={false} />
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
