"use client";

import { useEffect, useMemo, useState } from "react";
import { ChartNoAxesCombined, Dumbbell, Layers } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { GraficoTest, GraficoResultado } from "@/components/charts";
import { SelectorAtletas } from "@/components/dashboard/selector-atletas";
import { SelectorGraficos } from "@/components/dashboard/selector-graficos";
import { SelectorFiltro } from "@/components/dashboard/selector-filtro";
import { SelectorRango, RANGO_DASHBOARD_DEFECTO, type RangoDashboardValor } from "@/components/dashboard/selector-rango";
import { FASE_OPCIONES, fasePrefijo, ordenarFases } from "@/components/atletas/fase-utils";
import {
  catalogoGraficos,
  graficoResultadoId,
  resultadoIdDeGrafico,
  GRAFICOS_DASHBOARD_DEFECTO,
  type GraficoDef,
} from "@/lib/dashboard/graficos";
import {
  resumenZonaOptimaAcwr,
  serieCargaSemanal,
  serieReadinessMedia,
  serieSesionesCompletadas,
  serieSimetriaMedia,
} from "@/lib/dashboard/series";
import { rangoDesdeSemanas } from "@/lib/dashboard/series-tests";
import { useComparisonColors } from "@/lib/theme";
import { useAtletas, useCatalogoTests, useConfig, useDispatch, useRegistrosTests, useSesiones } from "@/lib/store";

function fmtEntero(n: number): string {
  return Math.round(n).toLocaleString("es-ES");
}

function rangoADesdeHasta(valor: RangoDashboardValor): { desde: Date; hasta: Date } {
  if (valor.tipo === "personalizado") {
    return { desde: new Date(`${valor.desde}T00:00:00`), hasta: new Date(`${valor.hasta}T00:00:00`) };
  }
  return rangoDesdeSemanas(valor.semanas);
}

export default function DashboardPage() {
  const atletas = useAtletas();
  const sesiones = useSesiones();
  const registrosTests = useRegistrosTests();
  const catalogoTests = useCatalogoTests();
  const config = useConfig();
  const dispatch = useDispatch();
  const comparisonColors = useComparisonColors();

  const [rango, setRango] = useState<RangoDashboardValor>(RANGO_DASHBOARD_DEFECTO);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [deportesSel, setDeportesSel] = useState<string[]>([]);
  const [fasesSel, setFasesSel] = useState<string[]>([]);

  const { desde, hasta } = useMemo(() => rangoADesdeHasta(rango), [rango]);
  const umbralesAcwr = useMemo(
    () => ({ bajo: config.umbrales.acwrBajo, alto: config.umbrales.acwrAlto }),
    [config.umbrales.acwrBajo, config.umbrales.acwrAlto]
  );

  const activos = useMemo(() => atletas.filter((a) => a.estado === "activo"), [atletas]);

  const deportesDisponibles = useMemo(
    () => Array.from(new Set(activos.map((a) => a.deporte))).sort((a, b) => a.localeCompare(b)),
    [activos]
  );
  const fasesDisponibles = useMemo(() => {
    const presentes = new Set(activos.map((a) => fasePrefijo(a.fase)));
    return ordenarFases(FASE_OPCIONES.filter((f) => presentes.has(f)));
  }, [activos]);

  // "Equipo" agregado: plantilla activa filtrada por deporte/fase — alimenta
  // TODOS los gráficos (agregado + lista del selector de atletas).
  const equipo = useMemo(
    () =>
      activos.filter(
        (a) =>
          (deportesSel.length === 0 || deportesSel.includes(a.deporte)) &&
          (fasesSel.length === 0 || fasesSel.includes(fasePrefijo(a.fase)))
      ),
    [activos, deportesSel, fasesSel]
  );

  // Si un filtro deja fuera a un atleta ya seleccionado para comparar, se quita.
  useEffect(() => {
    setSeleccionados((prev) => prev.filter((id) => equipo.some((a) => a.id === id)));
  }, [equipo]);

  const graficosCatalogo = useMemo(() => catalogoGraficos(catalogoTests), [catalogoTests]);
  const cuadranteFvId = graficoResultadoId("cuadrante-fv");

  const idsVisibles = useMemo(() => {
    const todosLosIds = new Set(graficosCatalogo.map((g) => g.id));
    const ordenConfig =
      config.dashboardGraficosOrden.length > 0 ? config.dashboardGraficosOrden : GRAFICOS_DASHBOARD_DEFECTO;
    const ordenCompleto = [...ordenConfig, ...Array.from(todosLosIds).filter((id) => !ordenConfig.includes(id))];
    const resto = ordenCompleto.filter(
      (id) => id !== cuadranteFvId && todosLosIds.has(id) && config.dashboardGraficos.includes(id)
    );
    return config.dashboardGraficos.includes(cuadranteFvId) && todosLosIds.has(cuadranteFvId)
      ? [cuadranteFvId, ...resto]
      : resto;
  }, [graficosCatalogo, config.dashboardGraficosOrden, config.dashboardGraficos, cuadranteFvId]);

  const graficosVisibles = useMemo(
    () =>
      idsVisibles
        .map((id) => graficosCatalogo.find((g) => g.id === id))
        .filter((g): g is GraficoDef => g !== undefined),
    [idsVisibles, graficosCatalogo]
  );

  // StatCards — snapshot de la última semana del periodo seleccionado.
  const ultimaCarga = serieCargaSemanal(equipo, 1, hasta)[0]?.agregado ?? null;
  const ultimaSimetria = serieSimetriaMedia(equipo, registrosTests, catalogoTests, 1, hasta)[0]?.agregado ?? null;
  const ultimoReadiness = serieReadinessMedia(equipo, 1, hasta)[0]?.agregado ?? null;
  const ultimasSesiones = serieSesionesCompletadas(equipo, sesiones, 1, hasta)[0]?.agregado ?? null;
  const zonaOptima = useMemo(() => resumenZonaOptimaAcwr(equipo, umbralesAcwr), [equipo, umbralesAcwr]);

  const toneZonaOptima =
    zonaOptima.total === 0
      ? "neutral"
      : zonaOptima.enOptima === zonaOptima.total
        ? "good"
        : zonaOptima.enOptima === 0
          ? "bad"
          : "neutral";

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Vista comparativa de la plantilla: agregado del equipo y hasta 6 atletas superpuestos, filtrable por deporte, fase y periodo."
      />

      <div className="sticky top-16 z-30 -mx-4 mb-6 flex flex-wrap items-center gap-3 border-b border-borderSoft bg-bg/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-bg/80 md:-mx-6 md:px-6">
        <SelectorAtletas
          atletas={equipo}
          seleccionados={seleccionados}
          onChange={setSeleccionados}
          colores={comparisonColors}
        />
        <SelectorGraficos
          catalogo={graficosCatalogo}
          seleccionados={config.dashboardGraficos}
          onChange={(next) => dispatch({ type: "CONFIG_ACTUALIZAR", payload: { dashboardGraficos: next } })}
        />
        <SelectorFiltro
          label="Deporte"
          icon={Dumbbell}
          opciones={deportesDisponibles}
          seleccionados={deportesSel}
          onChange={setDeportesSel}
        />
        <SelectorFiltro
          label="Fase"
          icon={Layers}
          opciones={fasesDisponibles}
          seleccionados={fasesSel}
          onChange={setFasesSel}
        />
        <SelectorRango valor={rango} onChange={setRango} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Atletas en zona óptima (ACWR)"
          value={`${zonaOptima.enOptima}/${zonaOptima.total}`}
          variation={{
            label:
              zonaOptima.total === 0
                ? "Sin datos"
                : `${Math.round((zonaOptima.enOptima / zonaOptima.total) * 100)}% del equipo`,
            tone: toneZonaOptima,
          }}
        />
        <StatCard
          label="Carga total, última semana"
          value={ultimaCarga !== null ? fmtEntero(ultimaCarga) : "N/D"}
          unit={ultimaCarga !== null ? "sRPE" : undefined}
        />
        <StatCard
          label="Simetría media del equipo"
          value={ultimaSimetria !== null ? ultimaSimetria.toFixed(0) : "N/D"}
          unit={ultimaSimetria !== null ? "%" : undefined}
        />
        <StatCard
          label="Readiness medio del equipo"
          value={ultimoReadiness !== null ? ultimoReadiness.toFixed(1) : "N/D"}
          unit={ultimoReadiness !== null ? "/10" : undefined}
        />
        <StatCard
          label="Sesiones completadas, última semana"
          value={ultimasSesiones !== null ? fmtEntero(ultimasSesiones) : "0"}
        />
      </div>

      {equipo.length === 0 ? (
        <EmptyState
          icon={ChartNoAxesCombined}
          title="Ningún atleta coincide con estos filtros"
          description="Ajusta el filtro de deporte o fase para ver de nuevo el equipo agregado."
        />
      ) : graficosVisibles.length === 0 ? (
        <EmptyState
          icon={ChartNoAxesCombined}
          title="Sin gráficos visibles"
          description="Activa algún gráfico desde el selector «Gráficos» de arriba."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {graficosVisibles.map((def) =>
            def.origen === "test" || def.tipo === "dispersion" ? (
              <GraficoTest
                key={def.id}
                def={def}
                registros={registrosTests}
                catalogo={catalogoTests}
                atletas={equipo}
                atletasSeleccionados={seleccionados}
                umbrales={config.umbrales}
                desde={desde}
                hasta={hasta}
              />
            ) : (
              <GraficoResultado
                key={def.id}
                id={resultadoIdDeGrafico(def.id)}
                def={def}
                atletas={equipo}
                atletasSeleccionados={seleccionados}
                registros={registrosTests}
                catalogo={catalogoTests}
                sesiones={sesiones}
                umbrales={config.umbrales}
                desde={desde}
                hasta={hasta}
              />
            )
          )}
        </div>
      )}
    </>
  );
}
