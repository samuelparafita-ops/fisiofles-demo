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
import { simetria, estadoSimetria, type EstadoSimetria } from "@/lib/calculations";
import { ChartPanel, ChartTooltipBox } from "./chart-panel";

export type SimetriaBarProps = {
  /** izq/der BRUTOS de cada test — el componente calcula el % con `simetria()`. */
  simetrias: { test: string; izq: number; der: number }[];
  className?: string;
};

const OBJETIVO_PCT = 90;

const ESTADO_COLOR: Record<EstadoSimetria, string> = {
  deficit: colors.data.compare,
  aceptable: colors.data.warn,
  optimo: colors.data.good,
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
      <p className="text-white">
        {d.lado}: {fmtValor(d.valor)}
      </p>
    </ChartTooltipBox>
  );
}

function SimetriaRow({ test, izq, der }: { test: string; izq: number; der: number }) {
  const pct = simetria(izq, der);
  const estado = estadoSimetria(pct);
  const fuerte = Math.max(izq, der);
  const debilEsIzq = izq <= der;

  const data = [
    { lado: "Izquierda", valor: izq, esDebil: debilEsIzq },
    { lado: "Derecha", valor: der, esDebil: !debilEsIzq },
  ];

  const dominio = fuerte * 1.2;
  const colorDebil =
    estado === "deficit" ? colors.data.compare : estado === "aceptable" ? colors.data.warn : colors.data.base;

  return (
    <div className="flex items-center gap-4 border-t border-chartGrid py-3 first:border-t-0 first:pt-0">
      <div className="w-32 shrink-0 text-xs font-medium text-chartText">{test}</div>
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
              tick={{ fill: colors.chartText, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <ReferenceLine
              x={0.9 * fuerte}
              stroke={colors.brand}
              strokeDasharray="4 3"
              label={{ value: "90%", position: "top", fill: colors.brand, fontSize: 10 }}
            />
            <Tooltip content={(props) => <SimetriaTooltip {...props} />} cursor={{ fill: colors.chartGrid, opacity: 0.3 }} />
            <Bar dataKey="valor" barSize={14} isAnimationActive={false}>
              {data.map((entry) => (
                <Cell key={entry.lado} fill={entry.esDebil ? colorDebil : colors.data.primary} />
              ))}
              <LabelList
                dataKey="valor"
                position="right"
                formatter={(v) => (typeof v === "number" ? fmtValor(v) : "")}
                fill={colors.chartText}
                fontSize={10}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="w-20 shrink-0 text-right">
        <p
          className="font-display text-2xl font-bold leading-none"
          style={{ color: ESTADO_COLOR[estado] }}
        >
          {pct.toFixed(0)}%
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-wide text-chartText">
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
export function SimetriaBar({ simetrias, className }: SimetriaBarProps) {
  const pcts = simetrias.map((s) => simetria(s.izq, s.der));
  const media = pcts.reduce((a, b) => a + b, 0) / pcts.length;

  return (
    <ChartPanel
      title="Simetrías en test"
      description="Índice de simetría bilateral (min/max) — objetivo 90%"
      className={className}
      action={
        <div className="text-right">
          <p className="font-display text-lg font-bold text-textStrong">
            {media.toFixed(0)}%
          </p>
          <p className="text-[11px] text-textDim">media · objetivo {OBJETIVO_PCT}%</p>
        </div>
      }
    >
      <div>
        {simetrias.map((s) => (
          <SimetriaRow key={s.test} test={s.test} izq={s.izq} der={s.der} />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 border-t border-chartGrid pt-3">
        <span className="flex items-center gap-1.5 text-xs text-chartText">
          <span className="inline-block size-2 rounded-full" style={{ background: colors.data.primary }} />
          Lado fuerte
        </span>
        <span className="flex items-center gap-1.5 text-xs text-chartText">
          <span className="inline-block size-2 rounded-full" style={{ background: colors.data.compare }} />
          Lado débil (déficit)
        </span>
        <span className="flex items-center gap-1.5 text-xs text-chartText">
          <span className="inline-block h-0.5 w-3" style={{ borderTop: `2px dashed ${colors.brand}` }} />
          Objetivo 90%
        </span>
      </div>
    </ChartPanel>
  );
}
