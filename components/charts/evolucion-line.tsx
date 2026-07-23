"use client";

import { useMemo, useState } from "react";
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
  type TooltipContentProps,
} from "recharts";
import { useChartColors, useChartGridColors } from "@/lib/theme";
import { ChartPanel, ChartTooltipBox } from "./chart-panel";

export type EvolucionLineProps = {
  evolucion: { fecha: string; dolor: number; carga: number; rpe: number }[];
  className?: string;
};

type SerieKey = "dolor" | "carga" | "rpe";

function fmtFecha(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function average(nums: number[]) {
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function EvolucionTooltip({
  active,
  payload,
  label,
  series,
}: TooltipContentProps & { series: Record<SerieKey, { label: string; color: string }> }) {
  if (!active || !payload?.length) return null;
  return (
    <ChartTooltipBox>
      <p className="mb-1 font-medium text-textStrong">{label}</p>
      {payload.map((entry) => {
        const key = entry.dataKey as SerieKey;
        const raw = (entry.payload as { cargaRaw: number })["cargaRaw"];
        const valor =
          key === "carga" ? `${raw} (${(entry.value as number).toFixed(1)} indexada)` : entry.value;
        return (
          <p key={key} style={{ color: entry.color }}>
            {series[key].label}: {valor}
          </p>
        );
      })}
    </ChartTooltipBox>
  );
}

/**
 * Evolución (dolor / carga / RPE) en el tiempo. La carga se indexa ÷100 para
 * compartir un único eje 0–10 con dolor y RPE (decisión de visualización,
 * no una fórmula del motor de cálculo); el tooltip muestra siempre el
 * valor bruto de carga.
 */
export function EvolucionLine({ evolucion, className }: EvolucionLineProps) {
  const chartColors = useChartColors();
  const gridColors = useChartGridColors();
  const SERIES: Record<SerieKey, { label: string; color: string }> = useMemo(
    () => ({
      dolor: { label: "Dolor (0–10)", color: chartColors.compare },
      carga: { label: "Carga (sRPE ÷ 100)", color: chartColors.primary },
      rpe: { label: "RPE (0–10)", color: chartColors.warn },
    }),
    [chartColors]
  );

  const [visibles, setVisibles] = useState<Set<SerieKey>>(
    new Set<SerieKey>(["dolor", "carga", "rpe"])
  );

  function toggle(key: SerieKey) {
    setVisibles((prev) => {
      const next = new Set(prev);
      if (next.has(key) && next.size > 1) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const data = evolucion.map((e) => ({
    fecha: fmtFecha(e.fecha),
    dolor: e.dolor,
    carga: e.carga / 100,
    cargaRaw: e.carga,
    rpe: e.rpe,
  }));

  const medias: Record<SerieKey, number> = {
    dolor: average(evolucion.map((e) => e.dolor)),
    carga: average(evolucion.map((e) => e.carga / 100)),
    rpe: average(evolucion.map((e) => e.rpe)),
  };

  return (
    <ChartPanel
      title="Evolución"
      description="Dolor, carga percibida y RPE por sesión"
      className={className}
      action={
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(SERIES) as SerieKey[]).map((key) => {
            const activo = visibles.has(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggle(key)}
                className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors"
                style={{
                  borderColor: activo ? SERIES[key].color : gridColors.grid,
                  color: activo ? SERIES[key].color : gridColors.axis,
                  background: activo ? `${SERIES[key].color}14` : "transparent",
                }}
              >
                <span
                  className="inline-block size-2 rounded-full"
                  style={{ background: activo ? SERIES[key].color : gridColors.line }}
                />
                {SERIES[key].label}
              </button>
            );
          })}
        </div>
      }
    >
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid stroke={gridColors.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="fecha"
              tick={{ fill: gridColors.axis, fontSize: 11 }}
              axisLine={{ stroke: gridColors.grid }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 10]}
              tick={{ fill: gridColors.axis, fontSize: 11 }}
              axisLine={{ stroke: gridColors.grid }}
              tickLine={false}
              width={32}
            />
            <Tooltip
              content={(props) => <EvolucionTooltip {...props} series={SERIES} />}
              cursor={{ stroke: gridColors.cursor }}
            />
            {visibles.has("dolor") && (
              <ReferenceLine
                y={0}
                stroke={SERIES.dolor.color}
                strokeDasharray="2 3"
                label={{
                  value: "Objetivo: sin dolor",
                  position: "insideBottomLeft",
                  fill: SERIES.dolor.color,
                  fontSize: 10,
                }}
              />
            )}
            {(Object.keys(SERIES) as SerieKey[]).map(
              (key) =>
                visibles.has(key) && (
                  <ReferenceLine
                    key={`media-${key}`}
                    y={medias[key]}
                    stroke={SERIES[key].color}
                    strokeDasharray="4 3"
                    strokeOpacity={0.5}
                    label={{
                      value: `Media ${medias[key].toFixed(1)}`,
                      position: "insideTopRight",
                      fill: SERIES[key].color,
                      fontSize: 10,
                    }}
                  />
                )
            )}
            {visibles.has("dolor") && (
              <Line
                dataKey="dolor"
                name="dolor"
                stroke={SERIES.dolor.color}
                strokeWidth={2}
                dot={{ r: 3, fill: SERIES.dolor.color, strokeWidth: 0 }}
                isAnimationActive={false}
              />
            )}
            {visibles.has("carga") && (
              <Line
                dataKey="carga"
                name="carga"
                stroke={SERIES.carga.color}
                strokeWidth={2}
                dot={{ r: 3, fill: SERIES.carga.color, strokeWidth: 0 }}
                isAnimationActive={false}
              />
            )}
            {visibles.has("rpe") && (
              <Line
                dataKey="rpe"
                name="rpe"
                stroke={SERIES.rpe.color}
                strokeWidth={2}
                dot={{ r: 3, fill: SERIES.rpe.color, strokeWidth: 0 }}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartPanel>
  );
}
