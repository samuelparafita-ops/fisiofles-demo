"use client";

import {
  Area,
  ComposedChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  type TooltipContentProps,
} from "recharts";
import { colors } from "@/lib/tokens";
import { useChartColors } from "@/lib/theme";
import { cargaCronica, acwr, zonaAcwr, type UmbralesAcwr } from "@/lib/calculations";
import { ChartPanel, LegendChip, ChartTooltipBox } from "./chart-panel";

const SEMANAS = 8;

export type ActividadPlantillaChartProps = {
  /** Atletas activos con su carga aguda semanal (sRPE) BRUTA — el componente calcula crónica/ratio/zona por atleta. */
  atletas: { id: string; acwr: { agudo: number }[] }[];
  umbrales: UmbralesAcwr;
  className?: string;
};

type PuntoSemana = {
  semana: string;
  cargaTotal: number;
  atletasEnZonaOptima: number;
};

function ActividadTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as PuntoSemana | undefined;
  if (!d) return null;
  return (
    <ChartTooltipBox>
      <p className="mb-1 font-medium text-textStrong">{label}</p>
      <p className="text-textDim">Carga total: {d.cargaTotal.toLocaleString("es-ES")} sRPE</p>
      <p className="text-textDim">Atletas en zona óptima: {d.atletasEnZonaOptima}</p>
    </ChartTooltipBox>
  );
}

/**
 * Agregado semanal de toda la plantilla activa: suma de carga aguda (sRPE) y
 * nº de atletas en zona óptima de ACWR, alineados por "semanas hacia atrás
 * desde la actual" (cada atleta tiene su propia numeración de semana de
 * proceso, así que no se puede alinear por la etiqueta `semana`).
 */
export function ActividadPlantillaChart({ atletas, umbrales, className }: ActividadPlantillaChartProps) {
  const chartColors = useChartColors();

  const puntos: PuntoSemana[] = [];
  for (let offset = SEMANAS - 1; offset >= 0; offset--) {
    let cargaTotal = 0;
    let enOptima = 0;
    for (const atleta of atletas) {
      const agudos = atleta.acwr.map((c) => c.agudo);
      const idx = agudos.length - 1 - offset;
      if (idx < 0) continue;
      cargaTotal += agudos[idx];
      const ratio = acwr(agudos[idx], cargaCronica(agudos, idx));
      if (ratio !== null && zonaAcwr(ratio, umbrales) === "optima") enOptima += 1;
    }
    puntos.push({
      semana: offset === 0 ? "Actual" : `Hace ${offset} sem.`,
      cargaTotal,
      atletasEnZonaOptima: enOptima,
    });
  }

  const actual = puntos[puntos.length - 1];
  const totalAtletas = atletas.length;

  return (
    <ChartPanel
      title="Actividad de la plantilla"
      description={`Carga semanal total (sRPE) y nº de atletas en zona óptima de ACWR — últimas ${SEMANAS} semanas`}
      metric={
        actual
          ? {
              value: `${actual.atletasEnZonaOptima}/${totalAtletas}`,
              label: "en zona óptima esta semana",
            }
          : undefined
      }
      className={className}
    >
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={puntos} margin={{ top: 8, right: 12, left: -4, bottom: 0 }}>
            <CartesianGrid stroke={colors.borderSoft} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="semana"
              tick={{ fill: colors.textDim, fontSize: 11 }}
              axisLine={{ stroke: colors.borderSoft }}
              tickLine={false}
            />
            <YAxis
              yAxisId="carga"
              tick={{ fill: colors.textDim, fontSize: 11 }}
              axisLine={{ stroke: colors.borderSoft }}
              tickLine={false}
              width={52}
            />
            <YAxis
              yAxisId="atletas"
              orientation="right"
              allowDecimals={false}
              domain={[0, Math.max(1, totalAtletas)]}
              tick={{ fill: colors.textDim, fontSize: 11 }}
              axisLine={{ stroke: colors.borderSoft }}
              tickLine={false}
              width={28}
            />
            <Tooltip content={(props) => <ActividadTooltip {...props} />} cursor={{ stroke: colors.borderSoft }} />
            <Area
              yAxisId="carga"
              type="monotone"
              dataKey="cargaTotal"
              stroke={chartColors.primary}
              fill={chartColors.primary}
              fillOpacity={0.12}
              strokeWidth={2}
              isAnimationActive={false}
            />
            <Line
              yAxisId="atletas"
              type="monotone"
              dataKey="atletasEnZonaOptima"
              stroke={chartColors.good}
              strokeWidth={2}
              dot={{ r: 3, fill: chartColors.good, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap gap-4">
        <LegendChip color={chartColors.primary} label="Carga total semanal (sRPE)" />
        <LegendChip color={chartColors.good} label="Atletas en zona óptima de ACWR" />
      </div>
    </ChartPanel>
  );
}
