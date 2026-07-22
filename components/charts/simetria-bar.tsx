"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  type TooltipContentProps,
} from "recharts";
import { colors } from "@/lib/tokens";
import { useChartColors, type ChartColors } from "@/lib/theme";
import { simetria, estadoSimetria, type EstadoSimetria, type UmbralesSimetria } from "@/lib/calculations";
import { ChartPanel, ChartTooltipBox } from "./chart-panel";

const UMBRALES_DEFECTO: UmbralesSimetria = { aceptable: 85, optimo: 90 };

export type SimetriaBarProps = {
  /** izq/der BRUTOS de cada test — el componente calcula el % con `simetria()`. */
  simetrias: { test: string; fecha?: string; izq: number; der: number }[];
  /** Siempre desde `useConfig().umbrales`, nunca hardcodeados (ver CLAUDE.md). */
  umbrales?: UmbralesSimetria;
  className?: string;
};

const ESTADO_COLOR: Record<EstadoSimetria, string> = {
  deficit: colors.state.bad,
  aceptable: colors.state.warn,
  optimo: colors.state.good,
};

const ESTADO_LABEL: Record<EstadoSimetria, string> = {
  deficit: "Déficit",
  aceptable: "Aceptable",
  optimo: "Óptimo",
};

function fmtValor(n: number) {
  return n < 10 ? n.toFixed(2) : n.toFixed(1);
}

function SimetriaTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as { lado: string; valor: number };
  return (
    <ChartTooltipBox>
      <p className="text-textStrong">
        {d.lado}: {fmtValor(d.valor)}
      </p>
    </ChartTooltipBox>
  );
}

function SimetriaRow({
  test,
  izq,
  der,
  umbrales,
  chartColors,
}: {
  test: string;
  izq: number;
  der: number;
  umbrales: UmbralesSimetria;
  chartColors: ChartColors;
}) {
  const pct = simetria(izq, der);
  const estado = estadoSimetria(pct, umbrales);
  const fuerte = Math.max(izq, der);
  const debilEsIzq = izq <= der;

  const data = [
    { lado: "Izquierda", valor: izq, esDebil: debilEsIzq },
    { lado: "Derecha", valor: der, esDebil: !debilEsIzq },
  ];

  const dominio = fuerte * 1.2;
  const colorDebil =
    estado === "deficit" ? chartColors.compare : estado === "aceptable" ? chartColors.warn : chartColors.base;

  return (
    <div className="flex items-center gap-4 border-t border-borderSoft py-3 first:border-t-0 first:pt-0">
      <div className="w-32 shrink-0 text-xs font-medium text-textDim">{test}</div>
      <div className="h-16 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 2, right: 40, left: 0, bottom: 2 }}
          >
            <XAxis type="number" domain={[0, dominio]} hide />
            <YAxis
              type="category"
              dataKey="lado"
              tick={{ fill: colors.textDim, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <ReferenceLine
              x={(umbrales.optimo / 100) * fuerte}
              stroke={chartColors.primary}
              strokeDasharray="4 3"
              label={{ value: `${umbrales.optimo}%`, position: "top", fill: chartColors.primary, fontSize: 10 }}
            />
            <Tooltip content={(props) => <SimetriaTooltip {...props} />} cursor={{ fill: colors.borderSoft, opacity: 0.5 }} />
            <Bar dataKey="valor" barSize={14} isAnimationActive={false}>
              {data.map((entry) => (
                <Cell key={entry.lado} fill={entry.esDebil ? colorDebil : chartColors.primary} />
              ))}
              <LabelList
                dataKey="valor"
                position="right"
                formatter={(v) => (typeof v === "number" ? fmtValor(v) : "")}
                fill={colors.textDim}
                fontSize={10}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="w-20 shrink-0 text-right">
        <p
          className="font-display text-3xl font-bold leading-none tracking-tight"
          style={{ color: ESTADO_COLOR[estado] }}
        >
          {pct.toFixed(0)}%
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-wide text-textDim">
          {ESTADO_LABEL[estado]}
        </p>
      </div>
    </div>
  );
}

/**
 * Simetrías en test — índice de simetría bilateral (LSI).
 * NO recalcula nada: llama a `simetria()` / `estadoSimetria()` por test.
 */
export function SimetriaBar({ simetrias, umbrales = UMBRALES_DEFECTO, className }: SimetriaBarProps) {
  const chartColors = useChartColors();
  const pcts = simetrias.map((s) => simetria(s.izq, s.der));
  const media = pcts.length > 0 ? pcts.reduce((a, b) => a + b, 0) / pcts.length : 0;

  return (
    <ChartPanel
      title="Simetrías en test"
      description={`Índice de simetría bilateral (min/max) — objetivo ${umbrales.optimo}%`}
      className={className}
      metric={{ value: `${media.toFixed(0)}%`, label: `media · objetivo ${umbrales.optimo}%` }}
    >
      <div>
        {simetrias.map((s, i) => (
          <SimetriaRow
            key={`${s.test}-${s.fecha}-${i}`}
            test={s.test}
            izq={s.izq}
            der={s.der}
            umbrales={umbrales}
            chartColors={chartColors}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 border-t border-borderSoft pt-3">
        <span className="flex items-center gap-1.5 text-xs text-textDim">
          <span className="inline-block size-2 rounded-full" style={{ background: chartColors.primary }} />
          Lado fuerte
        </span>
        <span className="flex items-center gap-1.5 text-xs text-textDim">
          <span className="inline-block size-2 rounded-full" style={{ background: chartColors.compare }} />
          Lado débil (déficit)
        </span>
        <span className="flex items-center gap-1.5 text-xs text-textDim">
          <span className="inline-block h-0.5 w-3" style={{ borderTop: `2px dashed ${chartColors.primary}` }} />
          Objetivo {umbrales.optimo}%
        </span>
      </div>
    </ChartPanel>
  );
}
