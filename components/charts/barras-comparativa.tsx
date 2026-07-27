"use client";

import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  type TooltipContentProps,
} from "recharts";
import { useChartColors, useChartGridColors, useComparisonColors } from "@/lib/theme";
import { promedio } from "@/lib/dashboard/series";
import { ChartPanel, ChartTooltipBox } from "./chart-panel";

export type BarraComparativaDato = { atletaId: string; nombre: string; valor: number | null };

export type BarrasComparativaProps = {
  titulo: string;
  descripcion?: string;
  /** Último valor por atleta (`lib/dashboard/series-tests.ts` → `ultimoValorPorAtleta`). */
  datos: BarraComparativaDato[];
  unidad?: string;
  /** Ids resaltados con los colores de comparación (orden = orden de selección); el resto queda en gris base. */
  seleccionados?: string[];
  lineaReferencia?: { valor: number; etiqueta?: string };
  formatoValor?: (n: number) => string;
  /** Controles de cabecera (variable, toggle de modo…) — ver GraficoTest. */
  action?: ReactNode;
  className?: string;
};

const fmtDefecto = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

function BarraTooltip({ active, payload, unidad }: TooltipContentProps & { unidad?: string }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as { nombre: string; valor: number } | undefined;
  if (!d) return null;
  return (
    <ChartTooltipBox>
      <p className="text-textStrong">
        {d.nombre}: {fmtDefecto(d.valor)}
        {unidad ?? ""}
      </p>
    </ChartTooltipBox>
  );
}

/**
 * Barras por atleta (último valor) — usada por `GraficoTest` en modo
 * "Por atleta". Los atletas seleccionados se resaltan con `useComparisonColors()`;
 * el resto queda en `chartColors.base` (gris) para que resalten los elegidos.
 */
export function BarrasComparativa({
  titulo,
  descripcion,
  datos,
  unidad,
  seleccionados = [],
  lineaReferencia,
  formatoValor = fmtDefecto,
  action,
  className,
}: BarrasComparativaProps) {
  const chartColors = useChartColors();
  const gridColors = useChartGridColors();
  const comparisonColors = useComparisonColors();

  const data = datos.filter((d): d is BarraComparativaDato & { valor: number } => d.valor !== null);
  const media = promedio(data.map((d) => d.valor));

  function colorDe(atletaId: string): string {
    const idx = seleccionados.indexOf(atletaId);
    if (idx === -1) return seleccionados.length > 0 ? gridColors.line : chartColors.primary;
    return comparisonColors[idx % comparisonColors.length];
  }

  return (
    <ChartPanel
      title={titulo}
      description={descripcion}
      action={action}
      metric={media !== null ? { value: `${formatoValor(media)}${unidad ?? ""}`, label: "media equipo" } : undefined}
      className={className}
    >
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid stroke={gridColors.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="nombre"
              tick={{ fill: gridColors.axis, fontSize: 11 }}
              axisLine={{ stroke: gridColors.grid }}
              tickLine={false}
              interval={0}
              angle={data.length > 6 ? -20 : 0}
              textAnchor={data.length > 6 ? "end" : "middle"}
              height={data.length > 6 ? 36 : 24}
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
            <Tooltip content={(props) => <BarraTooltip {...props} unidad={unidad} />} cursor={{ fill: gridColors.cursor, opacity: 0.5 }} />
            <Bar dataKey="valor" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              {data.map((d) => (
                <Cell key={d.atletaId} fill={colorDe(d.atletaId)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartPanel>
  );
}
