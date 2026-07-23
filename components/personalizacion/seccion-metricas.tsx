"use client";

import { SeccionCard } from "./seccion-card";
import { ListaReordenable } from "./lista-reordenable";
import { useToast } from "@/components/shared/toast";
import { useConfig, useDispatch } from "@/lib/store";
import { PANELES_FICHA } from "@/lib/personalizacion/paneles-ficha";
import { METRICAS_DASHBOARD } from "@/lib/dashboard/metricas";

export function SeccionMetricas() {
  const config = useConfig();
  const dispatch = useDispatch();
  const toast = useToast();

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
        <p className="text-sm font-semibold text-textStrong">Métricas de /dashboard</p>
        <p className="mt-0.5 text-xs text-textDim">Vista comparativa de la plantilla (carga, ACWR, simetría, dolor, sesiones).</p>
        <div className="mt-3">
          <ListaReordenable
            catalogo={METRICAS_DASHBOARD}
            visibles={config.dashboardMetricas}
            orden={config.dashboardOrden}
            onChange={({ visibles, orden }) => {
              dispatch({
                type: "CONFIG_ACTUALIZAR",
                payload: { dashboardMetricas: visibles, dashboardOrden: orden },
              });
              toast("Métricas de /dashboard actualizadas");
            }}
          />
        </div>
      </div>
    </SeccionCard>
  );
}
