"use client";

import { useMemo } from "react";
import { SeccionCard } from "./seccion-card";
import { ListaReordenable, type ItemReordenable } from "./lista-reordenable";
import { useToast } from "@/components/shared/toast";
import { useCatalogoTests, useConfig, useDispatch } from "@/lib/store";
import { PANELES_FICHA } from "@/lib/personalizacion/paneles-ficha";
import { catalogoGraficos } from "@/lib/dashboard/graficos";

export function SeccionMetricas() {
  const config = useConfig();
  const dispatch = useDispatch();
  const toast = useToast();
  const catalogoTests = useCatalogoTests();

  const catalogoGraficosDashboard: ItemReordenable[] = useMemo(
    () => catalogoGraficos(catalogoTests).map((g) => ({ id: g.id, label: g.titulo, descripcion: g.descripcion })),
    [catalogoTests]
  );

  return (
    <SeccionCard
      id="metricas-dashboard"
      title="Métricas y dashboard"
      description="Qué gráficos se muestran y en qué orden, tanto en la ficha de cada atleta como en /dashboard."
    >
      <div>
        <p className="text-sm font-semibold text-textStrong">Gráficos de la ficha de atleta</p>
        <p className="mt-0.5 text-xs text-textDim">Tab «Datos» de cada atleta (perfil físico, ACWR, simetrías, evolución).</p>
        <div className="mt-3">
          <ListaReordenable
            catalogo={PANELES_FICHA}
            visibles={config.metricasVisiblesDashboard}
            orden={config.ordenDashboard}
            onChange={({ visibles, orden }) => {
              dispatch({
                type: "CONFIG_ACTUALIZAR",
                payload: { metricasVisiblesDashboard: visibles, ordenDashboard: orden },
              });
              toast("Gráficos de la ficha actualizados");
            }}
          />
        </div>
      </div>

      <div className="mt-6 border-t border-borderSoft pt-5">
        <p className="text-sm font-semibold text-textStrong">Gráficos de /dashboard</p>
        <p className="mt-0.5 text-xs text-textDim">
          Vista comparativa de la plantilla — resultados (cuadrante F-V, ACWR, simetría…) y un gráfico por test. La
          visibilidad también se edita desde el selector «Gráficos» de la propia página; aquí se fija el ORDEN.
        </p>
        <div className="mt-3">
          <ListaReordenable
            catalogo={catalogoGraficosDashboard}
            visibles={config.dashboardGraficos}
            orden={config.dashboardGraficosOrden}
            onChange={({ visibles, orden }) => {
              dispatch({
                type: "CONFIG_ACTUALIZAR",
                payload: { dashboardGraficos: visibles, dashboardGraficosOrden: orden },
              });
              toast("Gráficos de /dashboard actualizados");
            }}
          />
        </div>
      </div>
    </SeccionCard>
  );
}
