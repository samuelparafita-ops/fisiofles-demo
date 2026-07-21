"use client";

import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceArea,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
  type TooltipContentProps,
} from "recharts";
import { colors } from "@/lib/tokens";
import { cargaCronica, acwr, zonaAcwr, type ZonaAcwr } from "@/lib/calculations";
import { ChartPanel, LegendChip, ChartTooltipBox } from "./chart-panel";

export type AcwrChartProps = {
  /** Carga aguda semanal (sRPE), BRUTA — el componente calcula crónica/ratio/zona. */
  cargas: { semana: string; agudo: number }[];
  className?: string;
};

const ZONA_LABEL: Record<ZonaAcwr, string> = {
  insuficiente: "Insuficiente",
  optima: "Óptima",
  riesgo: "Riesgo",
};

const ZONA_COLOR: Record<ZonaAcwr, string> = {
  insuficiente: colors.data.compare,
  optima: colors.data.good,
  riesgo: colors.data.warn,
};

function AcwrTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as {
    agudo: number;
    cronica: number | null;
    ratio: number | null;
    zona: ZonaAcwr | null;
  };
  return (
    <ChartTooltipBox>
      <p className="mb-1 font-medium text-white">{label}</p>
      <p className="text-chartText">Carga aguda: {d.agudo}</p>
      {d.cronica === null ? (
        <p className="mt-1 text-chartText">
          Crónica no calculable aún (faltan semanas previas)
        </p>
      ) : (
        <>
          <p className="text-chartText">Carga crónica: {d.cronica.toFixed(1)}</p>
          <p style={{ color: d.zona ? ZONA_COLOR[d.zona] : colors.data.base }}>
            ACWR: {d.ratio?.toFixed(2)} · {d.zona ? ZONA_LABEL[d.zona] : "—"}
          </p>
        </>
      )}
    </ChartTooltipBox>
  );
}

/**
 * ACWR (agudo:crónico) — media móvil de 4 semanas.
 * NO recalcula nada: llama a `cargaCronica()` / `acwr()` / `zonaAcwr()`.
 */
export function AcwrChart({ cargas, className }: AcwrChartProps) {
  const agudos = cargas.map((c) => c.agudo);

  const data = cargas.map((c, idx) => {
    const cronica = cargaCronica(agudos, idx);
    const ratio = acwr(c.agudo, cronica);
    return {
      semana: c.semana,
      agudo: c.agudo,
      cronica,
      ratio,
      zona: ratio !== null ? zonaAcwr(ratio) : null,
    };
  });

  const ratiosValidos = data
    .map((d) => d.ratio)
    .filter((r): r is number => r !== null);
  const media =
    ratiosValidos.length > 0
      ? ratiosValidos.reduce((a, b) => a + b, 0) / ratiosValidos.length
      : null;
  const objetivo = 1.0; // centro de la zona óptima (0.8–1.3)

  // Dominio "limpio" en pasos de 0.5 para que el eje Y no recorte etiquetas.
  const yMax = Math.max(2, ...ratiosValidos.map((r) => Math.ceil((r * 1.15) / 0.5) * 0.5));

  return (
    <ChartPanel
      title="ACWR · agudo:crónico"
      description="Media móvil de 4 semanas — riesgo de sobrecarga"
      className={className}
    >
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid stroke={colors.chartGrid} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="semana"
              tick={{ fill: colors.chartText, fontSize: 11 }}
              axisLine={{ stroke: colors.chartGrid }}
              tickLine={false}
            />
            <YAxis
              domain={[0, yMax]}
              ticks={Array.from({ length: yMax / 0.5 + 1 }, (_, i) => i * 0.5)}
              tick={{ fill: colors.chartText, fontSize: 11 }}
              axisLine={{ stroke: colors.chartGrid }}
              tickLine={false}
              width={40}
            />
            <ReferenceArea y1={0} y2={0.8} fill={colors.data.compare} fillOpacity={0.08} />
            <ReferenceArea y1={0.8} y2={1.3} fill={colors.data.good} fillOpacity={0.08} />
            <ReferenceArea y1={1.3} y2={yMax} fill={colors.data.warn} fillOpacity={0.08} />
            <ReferenceLine y={0.8} stroke={colors.chartGrid} strokeDasharray="4 3" />
            <ReferenceLine y={1.3} stroke={colors.chartGrid} strokeDasharray="4 3" />
            {media !== null && (
              <ReferenceLine
                y={media}
                stroke={colors.data.base}
                strokeDasharray="2 3"
                label={{
                  value: "Media",
                  position: "insideBottomLeft",
                  fill: colors.chartText,
                  fontSize: 10,
                }}
              />
            )}
            <ReferenceLine
              y={objetivo}
              stroke={colors.brand}
              strokeDasharray="5 2"
              label={{
                value: "Objetivo 1.0",
                position: "insideTopLeft",
                fill: colors.brand,
                fontSize: 10,
              }}
            />
            <Tooltip content={(props) => <AcwrTooltip {...props} />} cursor={{ stroke: colors.chartGrid }} />
            <Line
              dataKey="ratio"
              stroke={colors.data.primary}
              strokeWidth={2}
              dot={{ r: 3, fill: colors.data.primary, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              connectNulls={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap gap-4">
        <LegendChip color={colors.data.primary} label="ACWR" />
        <LegendChip color={colors.data.compare} label="Insuficiente (<0.8)" />
        <LegendChip color={colors.data.good} label="Óptima (0.8–1.3)" />
        <LegendChip color={colors.data.warn} label="Riesgo (>1.3)" />
        <LegendChip color={colors.brand} label="Objetivo" dashed />
      </div>
    </ChartPanel>
  );
}
