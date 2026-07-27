"use client";

import {
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  Scatter,
  ScatterChart,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  type TooltipContentProps,
} from "recharts";
import { useChartColors, useChartGridColors, useComparisonColors } from "@/lib/theme";
import { mediana } from "@/lib/dashboard/series-tests";
import { ChartPanel, ChartTooltipBox } from "./chart-panel";

export type PuntoCuadrante = { atletaId: string; nombre: string; x: number; y: number };

export type EtiquetasCuadrante = {
  altoAlto: string;
  bajoAlto: string;
  bajoBajo: string;
  altoBajo: string;
};

const ETIQUETAS_DEFECTO: EtiquetasCuadrante = {
  altoAlto: "Fuerte y rápido",
  bajoAlto: "Rápido, déficit de fuerza",
  bajoBajo: "Por desarrollar",
  altoBajo: "Fuerte, déficit de velocidad",
};

export type DispersionCuadranteProps = {
  titulo: string;
  descripcion?: string;
  /** Un punto por atleta (`lib/dashboard/series-tests.ts` → `puntosCuadranteFV`). */
  puntos: PuntoCuadrante[];
  ejeXLabel: string;
  ejeYLabel: string;
  unidadX?: string;
  unidadY?: string;
  /** Ids resaltados con los colores de comparación; el resto queda gris base (sin cuadrante "activo"). */
  seleccionados?: string[];
  etiquetasCuadrante?: EtiquetasCuadrante;
  className?: string;
};

function fmt(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

function crearTooltip(ejeXLabel: string, ejeYLabel: string, unidadX?: string, unidadY?: string) {
  return function CuadranteTooltip({ active, payload }: TooltipContentProps) {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload as PuntoCuadrante | undefined;
    if (!d) return null;
    return (
      <ChartTooltipBox>
        <p className="mb-1 font-medium text-textStrong">{d.nombre}</p>
        <p className="text-textDim">
          {ejeXLabel}: {fmt(d.x)}
          {unidadX ?? ""}
        </p>
        <p className="text-textDim">
          {ejeYLabel}: {fmt(d.y)}
          {unidadY ?? ""}
        </p>
      </ChartTooltipBox>
    );
  };
}

/**
 * Cuadrante fuerza-velocidad (y cualquier otro cruce de dos variables por
 * atleta): scatter con líneas de mediana en X/Y, cuadrantes discretos
 * etiquetados, y resaltado de los atletas seleccionados con los colores de
 * comparación — el resto de puntos queda en gris base. Sin variable
 * seleccionable: los ejes los fija el `GraficoDef` (ver `lib/dashboard/graficos.ts`).
 */
export function DispersionCuadrante({
  titulo,
  descripcion,
  puntos,
  ejeXLabel,
  ejeYLabel,
  unidadX,
  unidadY,
  seleccionados = [],
  etiquetasCuadrante = ETIQUETAS_DEFECTO,
  className,
}: DispersionCuadranteProps) {
  const chartColors = useChartColors();
  const gridColors = useChartGridColors();
  const comparisonColors = useComparisonColors();
  const TooltipContent = crearTooltip(ejeXLabel, ejeYLabel, unidadX, unidadY);

  if (puntos.length === 0) {
    return (
      <ChartPanel title={titulo} description={descripcion} className={className}>
        <p className="py-10 text-center text-sm text-textDim">
          Sin atletas con ambos valores registrados todavía.
        </p>
      </ChartPanel>
    );
  }

  const xs = puntos.map((p) => p.x);
  const ys = puntos.map((p) => p.y);
  const medianX = mediana(xs);
  const medianY = mediana(ys);

  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const padX = (xMax - xMin) * 0.15 || Math.max(xMax, 1) * 0.1;
  const padY = (yMax - yMin) * 0.15 || Math.max(yMax, 1) * 0.1;
  const domainX: [number, number] = [xMin - padX, xMax + padX];
  const domainY: [number, number] = [yMin - padY, yMax + padY];

  function colorDe(atletaId: string): string {
    const idx = seleccionados.indexOf(atletaId);
    if (idx === -1) return seleccionados.length > 0 ? gridColors.line : chartColors.primary;
    return comparisonColors[idx % comparisonColors.length];
  }

  const labelEstilo = { fill: gridColors.axis, fontSize: 10 } as const;
  const tickFormatter = (v: number) => v.toFixed(1);

  return (
    <ChartPanel title={titulo} description={descripcion} className={className}>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 16, left: -4, bottom: 4 }}>
            <CartesianGrid stroke={gridColors.grid} strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              name={ejeXLabel}
              domain={domainX}
              tickFormatter={tickFormatter}
              tick={{ fill: gridColors.axis, fontSize: 11 }}
              axisLine={{ stroke: gridColors.grid }}
              tickLine={false}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={ejeYLabel}
              domain={domainY}
              tickFormatter={tickFormatter}
              tick={{ fill: gridColors.axis, fontSize: 11 }}
              axisLine={{ stroke: gridColors.grid }}
              tickLine={false}
              width={44}
            />
            <ReferenceArea
              x1={medianX}
              x2={domainX[1]}
              y1={medianY}
              y2={domainY[1]}
              fill={chartColors.good}
              fillOpacity={0.05}
              label={{ value: etiquetasCuadrante.altoAlto, position: "insideTopRight", ...labelEstilo }}
            />
            <ReferenceArea
              x1={domainX[0]}
              x2={medianX}
              y1={medianY}
              y2={domainY[1]}
              fillOpacity={0}
              label={{ value: etiquetasCuadrante.bajoAlto, position: "insideTopLeft", ...labelEstilo }}
            />
            <ReferenceArea
              x1={domainX[0]}
              x2={medianX}
              y1={domainY[0]}
              y2={medianY}
              fill={chartColors.compare}
              fillOpacity={0.05}
              label={{ value: etiquetasCuadrante.bajoBajo, position: "insideBottomLeft", ...labelEstilo }}
            />
            <ReferenceArea
              x1={medianX}
              x2={domainX[1]}
              y1={domainY[0]}
              y2={medianY}
              fillOpacity={0}
              label={{ value: etiquetasCuadrante.altoBajo, position: "insideBottomRight", ...labelEstilo }}
            />
            <ReferenceLine x={medianX} stroke={gridColors.line} strokeDasharray="4 3" />
            <ReferenceLine y={medianY} stroke={gridColors.line} strokeDasharray="4 3" />
            <Tooltip content={(props) => <TooltipContent {...props} />} cursor={{ strokeDasharray: "3 3", stroke: gridColors.cursor }} />
            <Scatter data={puntos} isAnimationActive={false}>
              {puntos.map((p) => (
                <Cell key={p.atletaId} fill={colorDe(p.atletaId)} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap justify-between gap-2 text-[11px] text-textDim">
        <span>→ Eje X: {ejeXLabel}</span>
        <span>↑ Eje Y: {ejeYLabel}</span>
      </div>
    </ChartPanel>
  );
}
