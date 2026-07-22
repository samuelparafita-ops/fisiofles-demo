"use client";

import { useMemo, useState } from "react";
import { ChartNoAxesCombined } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { MultiSeriesLine, type AtletaSerie } from "@/components/charts";
import { SelectorAtletas } from "@/components/dashboard/selector-atletas";
import { SelectorMetricas } from "@/components/dashboard/selector-metricas";
import { SelectorRango } from "@/components/dashboard/selector-rango";
import { METRICAS_DASHBOARD_IDS, RANGO_SEMANAS_DEFECTO, type RangoSemanas } from "@/lib/dashboard/metricas";
import {
  resumenZonaOptimaAcwr,
  serieAcwr,
  serieCargaSemanal,
  serieDolorMedio,
  serieSesionesCompletadas,
  serieSimetriaMedia,
} from "@/lib/dashboard/series";
import { colors } from "@/lib/tokens";
import { useChartColors, useComparisonColors } from "@/lib/theme";
import {
  useAtletas,
  useCatalogoTests,
  useConfig,
  useRegistrosTests,
  useSesiones,
} from "@/lib/store";

function fmtEntero(n: number): string {
  return Math.round(n).toLocaleString("es-ES");
}

export default function DashboardPage() {
  const atletas = useAtletas();
  const sesiones = useSesiones();
  const registrosTests = useRegistrosTests();
  const catalogoTests = useCatalogoTests();
  const config = useConfig();
  const chartColors = useChartColors();
  const comparisonColors = useComparisonColors();

  const [rango, setRango] = useState<RangoSemanas>(RANGO_SEMANAS_DEFECTO);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);

  const hoy = useMemo(() => new Date(), []);
  const activos = useMemo(() => atletas.filter((a) => a.estado === "activo"), [atletas]);
  const umbralesAcwr = useMemo(
    () => ({ bajo: config.umbrales.acwrBajo, alto: config.umbrales.acwrAlto }),
    [config.umbrales.acwrBajo, config.umbrales.acwrAlto]
  );

  const atletasResueltos: AtletaSerie[] = useMemo(
    () =>
      seleccionados.map((id, idx) => ({
        id,
        nombre: atletas.find((a) => a.id === id)?.nombre ?? id,
        color: comparisonColors[idx % comparisonColors.length],
      })),
    [seleccionados, atletas, comparisonColors]
  );

  const serieCarga = useMemo(() => serieCargaSemanal(activos, rango, hoy), [activos, rango, hoy]);
  const serieAcwrPts = useMemo(() => serieAcwr(activos, rango, hoy), [activos, rango, hoy]);
  const serieSimetria = useMemo(
    () => serieSimetriaMedia(activos, registrosTests, catalogoTests, rango, hoy),
    [activos, registrosTests, catalogoTests, rango, hoy]
  );
  const serieDolor = useMemo(() => serieDolorMedio(activos, rango, hoy), [activos, rango, hoy]);
  const serieSesiones = useMemo(
    () => serieSesionesCompletadas(activos, sesiones, rango, hoy),
    [activos, sesiones, rango, hoy]
  );

  const zonaOptima = useMemo(() => resumenZonaOptimaAcwr(activos, umbralesAcwr), [activos, umbralesAcwr]);

  const ultimaCarga = serieCarga.at(-1)?.agregado ?? null;
  const ultimaAcwr = serieAcwrPts.at(-1)?.agregado ?? null;
  const ultimaSimetria = serieSimetria.at(-1)?.agregado ?? null;
  const ultimoDolor = serieDolor.at(-1)?.agregado ?? null;
  const ultimasSesiones = serieSesiones.at(-1)?.agregado ?? null;

  // Bandas de riesgo del ACWR — mismos umbrales de config que el resto de la
  // app (ver CLAUDE.md), mismo patrón visual que components/charts/acwr-chart.tsx.
  const ratiosValidos = serieAcwrPts.flatMap((p) => [p.agregado, ...Object.values(p.porAtleta)]).filter(
    (r): r is number => r !== null
  );
  const yMaxAcwr = Math.max(2, ...ratiosValidos.map((r) => Math.ceil((r * 1.15) / 0.5) * 0.5));
  const bandasAcwr = [
    { y1: 0, y2: umbralesAcwr.bajo, color: chartColors.compare },
    { y1: umbralesAcwr.bajo, y2: umbralesAcwr.alto, color: chartColors.good },
    { y1: umbralesAcwr.alto, y2: yMaxAcwr, color: chartColors.warn },
  ];
  const lineasAcwr = [
    { y: umbralesAcwr.bajo, color: colors.border },
    { y: umbralesAcwr.alto, color: colors.border },
  ];

  const PANELES: Record<string, JSX.Element> = {
    carga: (
      <MultiSeriesLine
        key="carga"
        title="Carga semanal (sRPE)"
        description={`Suma de carga aguda de la plantilla activa · últimas ${rango} semanas`}
        puntos={serieCarga}
        atletas={atletasResueltos}
        etiquetaAgregado="Total plantilla"
        formatoValor={fmtEntero}
        metric={ultimaCarga !== null ? { value: fmtEntero(ultimaCarga), label: "total esta semana" } : undefined}
      />
    ),
    acwr: (
      <MultiSeriesLine
        key="acwr"
        title="ACWR · agudo:crónico"
        description={`Media de la plantilla activa, con bandas de riesgo · últimas ${rango} semanas`}
        puntos={serieAcwrPts}
        atletas={atletasResueltos}
        etiquetaAgregado="Media plantilla"
        formatoValor={(n) => n.toFixed(2)}
        dominioY={[0, yMaxAcwr]}
        bandas={bandasAcwr}
        lineasReferencia={lineasAcwr}
        metric={ultimaAcwr !== null ? { value: ultimaAcwr.toFixed(2), label: "media esta semana" } : undefined}
      />
    ),
    simetria: (
      <MultiSeriesLine
        key="simetria"
        title="Simetría media"
        description={`Simetría bilateral interpolada entre tests · últimas ${rango} semanas`}
        puntos={serieSimetria}
        atletas={atletasResueltos}
        etiquetaAgregado="Media plantilla"
        formatoValor={(n) => `${n.toFixed(0)}%`}
        dominioY={[0, 100]}
        unidad="%"
        metric={ultimaSimetria !== null ? { value: `${ultimaSimetria.toFixed(0)}%`, label: "media del equipo" } : undefined}
      />
    ),
    dolor: (
      <MultiSeriesLine
        key="dolor"
        title="Dolor medio"
        description={`Dolor (EVA 0-10) interpolado entre registros · últimas ${rango} semanas`}
        puntos={serieDolor}
        atletas={atletasResueltos}
        etiquetaAgregado="Media plantilla"
        formatoValor={(n) => n.toFixed(1)}
        dominioY={[0, 10]}
        metric={ultimoDolor !== null ? { value: ultimoDolor.toFixed(1), label: "medio del equipo" } : undefined}
      />
    ),
    sesiones: (
      <MultiSeriesLine
        key="sesiones"
        title="Sesiones completadas/semana"
        description={`Nº de sesiones completadas en la plantilla activa · últimas ${rango} semanas`}
        puntos={serieSesiones}
        atletas={atletasResueltos}
        etiquetaAgregado="Total plantilla"
        formatoValor={fmtEntero}
        metric={ultimasSesiones !== null ? { value: fmtEntero(ultimasSesiones), label: "esta semana" } : undefined}
      />
    ),
  };

  const ordenVisible = (config.dashboardOrden.length > 0 ? config.dashboardOrden : METRICAS_DASHBOARD_IDS).filter(
    (id) => config.dashboardMetricas.includes(id) && id in PANELES
  );

  const toneZonaOptima = zonaOptima.total === 0 ? "neutral" : zonaOptima.enOptima === zonaOptima.total ? "good" : zonaOptima.enOptima === 0 ? "bad" : "neutral";

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Vista comparativa de la plantilla: agregado del equipo y hasta 4 atletas superpuestos."
      />

      <div className="sticky top-16 z-30 -mx-4 mb-6 flex flex-wrap items-center gap-3 border-b border-borderSoft bg-bg/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-bg/80 md:-mx-6 md:px-6">
        <SelectorAtletas
          atletas={atletas}
          seleccionados={seleccionados}
          onChange={setSeleccionados}
          colores={comparisonColors}
        />
        <SelectorMetricas />
        <SelectorRango valor={rango} onChange={setRango} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Atletas en zona óptima (ACWR)"
          value={`${zonaOptima.enOptima}/${zonaOptima.total}`}
          variation={{
            label: zonaOptima.total === 0 ? "Sin datos" : `${Math.round((zonaOptima.enOptima / zonaOptima.total) * 100)}% de la plantilla`,
            tone: toneZonaOptima,
          }}
        />
        <StatCard
          label="Carga total esta semana"
          value={ultimaCarga !== null ? fmtEntero(ultimaCarga) : "N/D"}
          unit={ultimaCarga !== null ? "sRPE" : undefined}
        />
        <StatCard
          label="Simetría media del equipo"
          value={ultimaSimetria !== null ? ultimaSimetria.toFixed(0) : "N/D"}
          unit={ultimaSimetria !== null ? "%" : undefined}
        />
        <StatCard
          label="Sesiones completadas esta semana"
          value={ultimasSesiones !== null ? fmtEntero(ultimasSesiones) : "0"}
        />
      </div>

      {ordenVisible.length === 0 ? (
        <EmptyState
          icon={ChartNoAxesCombined}
          title="Sin métricas visibles"
          description="Activa alguna métrica desde el selector de arriba para ver los gráficos."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">{ordenVisible.map((id) => PANELES[id])}</div>
      )}
    </>
  );
}
