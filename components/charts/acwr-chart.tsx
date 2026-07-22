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
import { useChartColors } from "@/lib/theme";
import { cargaCronica, acwr, zonaAcwr, type UmbralesAcwr, type ZonaAcwr } from "@/lib/calculations";
import { ChartPanel, LegendChip, ChartTooltipBox } from "./chart-panel";

const UMBRALES_DEFECTO: UmbralesAcwr = { bajo: 0.8, alto: 1.3 };

export type AcwrChartProps = {
  /** Carga aguda semanal (sRPE), BRUTA — el componente calcula crónica/ratio/zona. */
  cargas: { semana: string; agudo: number }[];
  /** Bandas de riesgo — siempre desde `useConfig().umbrales`, nunca hardcodeadas (ver CLAUDE.md). */
  umbrales?: UmbralesAcwr;
  className?: string;
};

const ZONA_LABEL: Record<ZonaAcwr, string> = {
  insuficiente: "Insuficiente",
  optima: "Óptima",
  riesgo: "Riesgo",
};

function AcwrTooltip({
  active,
  payload,
  label,
  zonaColor,
}: TooltipContentProps & { zonaColor: Record<ZonaAcwr, string> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as {
    agudo: number;
    cronica: number | null;
    ratio: number | null;
    zona: ZonaAcwr | null;
  };
  return (
    <ChartTooltipBox>
      <p className="mb-1 font-medium text-textStrong">{label}</p>
      <p className="text-textDim">Carga aguda: {d.agudo}</p>
      {d.cronica === null ? (
        <p className="mt-1 text-textDim">
          Crónica no calculable aún (faltan semanas previas)
        </p>
      ) : (
        <>
          <p className="text-textDim">Carga crónica: {d.cronica.toFixed(1)}</p>
          <p style={{ color: d.zona ? zonaColor[d.zona] : colors.textDim }}>
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
export function AcwrChart({ cargas, umbrales = UMBRALES_DEFECTO, className }: AcwrChartProps) {
  const chartColors = useChartColors();
  const ZONA_COLOR: Record<ZonaAcwr, string> = {
    insuficiente: colors.state.bad,
    optima: colors.state.good,
    riesgo: colors.state.warn,
  };
  const agudos = cargas.map((c) => c.agudo);

  const data = cargas.map((c, idx) => {
    const cronica = cargaCronica(agudos, idx);
    const ratio = acwr(c.agudo, cronica);
    return {
      semana: c.semana,
      agudo: c.agudo,
      cronica,
      ratio,
      zona: ratio !== null ? zonaAcwr(ratio, umbrales) : null,
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
            <CartesianGrid stroke={colors.borderSoft} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="semana"
              tick={{ fill: colors.textDim, fontSize: 11 }}
              axisLine={{ stroke: colors.borderSoft }}
              tickLine={false}
            />
            <YAxis
              domain={[0, yMax]}
              ticks={Array.from({ length: yMax / 0.5 + 1 }, (_, i) => i * 0.5)}
              tick={{ fill: colors.textDim, fontSize: 11 }}
              axisLine={{ stroke: colors.borderSoft }}
              tickLine={false}
              width={40}
            />
            <ReferenceArea y1={0} y2={umbrales.bajo} fill={chartColors.compare} fillOpacity={0.07} />
            <ReferenceArea y1={umbrales.bajo} y2={umbrales.alto} fill={chartColors.good} fillOpacity={0.07} />
            <ReferenceArea y1={umbrales.alto} y2={yMax} fill={chartColors.warn} fillOpacity={0.07} />
            <ReferenceLine y={umbrales.bajo} stroke={colors.border} strokeDasharray="4 3" />
            <ReferenceLine y={umbrales.alto} stroke={colors.border} strokeDasharray="4 3" />
            {media !== null && (
              <ReferenceLine
                y={media}
                stroke={chartColors.base}
                strokeDasharray="2 3"
                label={{
                  value: "Media",
                  position: "insideBottomLeft",
                  fill: colors.textDim,
                  fontSize: 10,
                }}
              />
            )}
            <ReferenceLine
              y={objetivo}
              stroke={chartColors.primary}
              strokeDasharray="5 2"
              label={{
                value: "Objetivo 1.0",
                position: "insideTopLeft",
                fill: chartColors.primary,
                fontSize: 10,
              }}
            />
            <Tooltip
              content={(props) => <AcwrTooltip {...props} zonaColor={ZONA_COLOR} />}
              cursor={{ stroke: colors.borderSoft }}
            />
            <Line
              dataKey="ratio"
              stroke={chartColors.primary}
              strokeWidth={2}
              dot={{ r: 3, fill: chartColors.primary, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              connectNulls={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap gap-4">
        <LegendChip color={chartColors.primary} label="ACWR" />
        <LegendChip color={chartColors.compare} label={`Insuficiente (<${umbrales.bajo})`} />
        <LegendChip color={chartColors.good} label={`Óptima (${umbrales.bajo}–${umbrales.alto})`} />
        <LegendChip color={chartColors.warn} label={`Riesgo (>${umbrales.alto})`} />
        <LegendChip color={chartColors.primary} label="Objetivo" dashed />
      </div>
    </ChartPanel>
  );
}
