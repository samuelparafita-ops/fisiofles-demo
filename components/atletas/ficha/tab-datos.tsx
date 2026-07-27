"use client";

import { useMemo, useState } from "react";
import { ChartNoAxesCombined } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { GraficoTest, GraficoResultado } from "@/components/charts";
import { SelectorGraficos } from "@/components/dashboard/selector-graficos";
import {
  SelectorRango,
  RANGO_DASHBOARD_DEFECTO,
  type RangoDashboardValor,
} from "@/components/dashboard/selector-rango";
import { TestsTable } from "@/components/atletas/tests-table";
import { RegistrarTestDialog } from "@/components/atletas/ficha/registrar-test-dialog";
import { catalogoGraficos, resultadoIdDeGrafico, type GraficoDef } from "@/lib/dashboard/graficos";
import { rangoDesdeSemanas } from "@/lib/dashboard/series-tests";
import {
  useAtletas,
  useCatalogoTests,
  useConfig,
  useDispatch,
  useRegistrosDeAtleta,
  useRegistrosTests,
  useSesiones,
  type Atleta,
} from "@/lib/store";

function rangoADesdeHasta(valor: RangoDashboardValor): { desde: Date; hasta: Date } {
  if (valor.tipo === "personalizado") {
    return { desde: new Date(`${valor.desde}T00:00:00`), hasta: new Date(`${valor.hasta}T00:00:00`) };
  }
  return rangoDesdeSemanas(valor.semanas);
}

/**
 * Tab Datos de la ficha — MISMO motor de gráficos que /dashboard (FASE 4),
 * individualizado: el atleta de esta ficha va siempre resaltado
 * (`atletasSeleccionados`) y el agregado del resto del equipo activo queda
 * de fondo en gris — al revés que en /dashboard, donde el agregado es el
 * protagonista. Sin selector de atletas (el atleta es fijo) ni cuadrante F-V
 * visible por defecto (es una lectura de equipo, no individual).
 */
export function TabDatos({ atleta }: { atleta: Atleta }) {
  const todosAtletas = useAtletas();
  const registrosTests = useRegistrosTests();
  const catalogoTests = useCatalogoTests();
  const sesiones = useSesiones();
  const config = useConfig();
  const dispatch = useDispatch();

  const registrosAtleta = useRegistrosDeAtleta(atleta.id);
  const umbralesSimetria = { aceptable: config.umbrales.simetriaAceptable, optimo: config.umbrales.simetriaObjetivo };

  const [rango, setRango] = useState<RangoDashboardValor>(RANGO_DASHBOARD_DEFECTO);
  const { desde, hasta } = useMemo(() => rangoADesdeHasta(rango), [rango]);

  // Equipo de referencia para el agregado gris: todos los activos + el propio
  // atleta (aunque esté de alta/pausa, para que su serie individual siempre
  // tenga datos aunque no entre en el agregado "activo" habitual).
  const equipo = useMemo(() => {
    const activos = todosAtletas.filter((a) => a.estado === "activo");
    return activos.some((a) => a.id === atleta.id) ? activos : [atleta, ...activos];
  }, [todosAtletas, atleta]);

  const graficosCatalogo = useMemo(() => catalogoGraficos(catalogoTests), [catalogoTests]);

  const idsVisibles = useMemo(() => {
    const todosLosIds = new Set(graficosCatalogo.map((g) => g.id));
    const ordenConfig = config.fichaGraficosOrden.length > 0 ? config.fichaGraficosOrden : config.fichaGraficos;
    const ordenCompleto = [...ordenConfig, ...Array.from(todosLosIds).filter((id) => !ordenConfig.includes(id))];
    return ordenCompleto.filter((id) => todosLosIds.has(id) && config.fichaGraficos.includes(id));
  }, [graficosCatalogo, config.fichaGraficosOrden, config.fichaGraficos]);

  const graficosVisibles = useMemo(
    () =>
      idsVisibles
        .map((id) => graficosCatalogo.find((g) => g.id === id))
        .filter((g): g is GraficoDef => g !== undefined),
    [idsVisibles, graficosCatalogo]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <SelectorGraficos
          catalogo={graficosCatalogo}
          seleccionados={config.fichaGraficos}
          onChange={(next) => dispatch({ type: "CONFIG_ACTUALIZAR", payload: { fichaGraficos: next } })}
        />
        <SelectorRango valor={rango} onChange={setRango} />
      </div>

      {graficosVisibles.length === 0 ? (
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
                atletasSeleccionados={[atleta.id]}
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
                atletasSeleccionados={[atleta.id]}
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

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-display text-base font-bold text-textStrong">Histórico de tests</h3>
          <RegistrarTestDialog atletaId={atleta.id} />
        </div>
        <TestsTable registros={registrosAtleta} catalogo={catalogoTests} umbrales={umbralesSimetria} />
      </div>
    </div>
  );
}
