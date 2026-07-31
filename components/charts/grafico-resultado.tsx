"use client";

import { useChartColors, useChartGridColors, useComparisonColorsExtended } from "@/lib/theme";
import {
  serieAcwr,
  serieCargaSemanal,
  serieDolorMedio,
  serieReadinessMedia,
  serieSesionesCompletadas,
  serieSimetriaMedia,
} from "@/lib/dashboard/series";
import { semanasDesdeRango } from "@/lib/dashboard/series-tests";
import type { GraficoDef, ResultadoDashboardId } from "@/lib/dashboard/graficos";
import type { Atleta, RegistroTest, Sesion, TestDef, UmbralesConfig } from "@/lib/store/types";
import { MultiSeriesLine, type AtletaSerie } from "./multi-series-line";
import { BarrasTemporal } from "./barras-temporal";

function fmtEntero(n: number): string {
  return Math.round(n).toLocaleString("es-ES");
}

export type GraficoResultadoProps = {
  /** La dispersión F-V no se resuelve aquí — la cubre `GraficoTest` directamente (ver dashboard). */
  id: ResultadoDashboardId;
  def: GraficoDef;
  /** Plantilla del "equipo" agregado (ya filtrada por deporte/fase). */
  atletas: Atleta[];
  /** Ids resaltados/superpuestos — sin tope, ver `useComparisonColorsExtended()`. */
  atletasSeleccionados?: string[];
  registros: RegistroTest[];
  catalogo: TestDef[];
  sesiones: Sesion[];
  umbrales: UmbralesConfig;
  desde: Date;
  hasta: Date;
  className?: string;
};

/**
 * Render de los `resultado:*` del dashboard v3 que NO son la dispersión F-V
 * (esa la cubre `GraficoTest` directamente, ver `lib/dashboard/graficos.ts`).
 * Reutiliza las series agregado+por-atleta de `lib/dashboard/series.ts`
 * (FASE E) sobre `MultiSeriesLine` (tipo "linea") o `BarrasTemporal` (tipo
 * "barras") — mismos componentes que ya usa `GraficoTest` en modo Evolución.
 * `desde`/`hasta` se traducen a `semanas` con `semanasDesdeRango` porque estas
 * series heredadas cuentan hacia atrás desde `hoy` (aquí, `hasta`).
 */
export function GraficoResultado({
  id,
  def,
  atletas,
  atletasSeleccionados = [],
  registros,
  catalogo,
  sesiones,
  umbrales,
  desde,
  hasta,
  className,
}: GraficoResultadoProps) {
  const chartColors = useChartColors();
  const gridColors = useChartGridColors();
  const comparisonColors = useComparisonColorsExtended(atletasSeleccionados.length);

  const semanas = semanasDesdeRango(desde, hasta);
  const atletasSerie: AtletaSerie[] = atletasSeleccionados.map((atletaId, idx) => ({
    id: atletaId,
    nombre: atletas.find((a) => a.id === atletaId)?.nombre ?? atletaId,
    color: comparisonColors[idx],
  }));

  switch (id) {
    case "carga": {
      const puntos = serieCargaSemanal(atletas, semanas, hasta);
      return (
        <BarrasTemporal
          titulo={def.titulo}
          descripcion={def.descripcion}
          puntos={puntos}
          atletas={atletasSerie}
          etiquetaAgregado="Total plantilla"
          formatoValor={fmtEntero}
          className={className}
        />
      );
    }

    case "acwr": {
      const puntos = serieAcwr(atletas, semanas, hasta);
      const ratiosValidos = puntos
        .flatMap((p) => [p.agregado, ...Object.values(p.porAtleta)])
        .filter((r): r is number => r !== null);
      const yMax = Math.max(2, ...ratiosValidos.map((r) => Math.ceil((r * 1.15) / 0.5) * 0.5));
      const bandas = [
        { y1: 0, y2: umbrales.acwrBajo, color: chartColors.compare },
        { y1: umbrales.acwrBajo, y2: umbrales.acwrAlto, color: chartColors.good },
        { y1: umbrales.acwrAlto, y2: yMax, color: chartColors.warn },
      ];
      const lineasReferencia = [
        { y: umbrales.acwrBajo, color: gridColors.line },
        { y: umbrales.acwrAlto, color: gridColors.line },
      ];
      const ultima = puntos.at(-1)?.agregado ?? null;
      return (
        <MultiSeriesLine
          title={def.titulo}
          description={def.descripcion}
          puntos={puntos}
          atletas={atletasSerie}
          etiquetaAgregado="Media plantilla"
          formatoValor={(n) => n.toFixed(2)}
          dominioY={[0, yMax]}
          bandas={bandas}
          lineasReferencia={lineasReferencia}
          metric={ultima !== null ? { value: ultima.toFixed(2), label: "media, última semana" } : undefined}
          className={className}
        />
      );
    }

    case "simetria": {
      const puntos = serieSimetriaMedia(atletas, registros, catalogo, semanas, hasta);
      return (
        <BarrasTemporal
          titulo={def.titulo}
          descripcion={def.descripcion}
          puntos={puntos}
          atletas={atletasSerie}
          etiquetaAgregado="Media equipo"
          unidad="%"
          lineaReferencia={{ valor: umbrales.simetriaObjetivo, etiqueta: `Objetivo ${umbrales.simetriaObjetivo}%` }}
          className={className}
        />
      );
    }

    case "dolor": {
      const puntos = serieDolorMedio(atletas, semanas, hasta);
      const ultima = puntos.at(-1)?.agregado ?? null;
      return (
        <MultiSeriesLine
          title={def.titulo}
          description={def.descripcion}
          puntos={puntos}
          atletas={atletasSerie}
          etiquetaAgregado="Media plantilla"
          formatoValor={(n) => n.toFixed(1)}
          dominioY={[0, 10]}
          metric={ultima !== null ? { value: ultima.toFixed(1), label: "medio del equipo" } : undefined}
          className={className}
        />
      );
    }

    case "sesiones": {
      const puntos = serieSesionesCompletadas(atletas, sesiones, semanas, hasta);
      return (
        <BarrasTemporal
          titulo={def.titulo}
          descripcion={def.descripcion}
          puntos={puntos}
          atletas={atletasSerie}
          etiquetaAgregado="Total plantilla"
          formatoValor={fmtEntero}
          className={className}
        />
      );
    }

    case "readiness": {
      const puntos = serieReadinessMedia(atletas, semanas, hasta);
      const ultima = puntos.at(-1)?.agregado ?? null;
      return (
        <MultiSeriesLine
          title={def.titulo}
          description={def.descripcion}
          puntos={puntos}
          atletas={atletasSerie}
          etiquetaAgregado="Media plantilla"
          formatoValor={(n) => n.toFixed(1)}
          dominioY={[0, 10]}
          metric={ultima !== null ? { value: ultima.toFixed(1), label: "medio del equipo" } : undefined}
          className={className}
        />
      );
    }

    case "cuadrante-fv":
    default:
      return null;
  }
}
