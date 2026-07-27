/**
 * Ids de los gráficos del dashboard v3 — los comparten `config.dashboardGraficos`
 * / `dashboardGraficosOrden` (semilla y Personalización) y la página de dashboard.
 * Dos familias:
 * - `test:<testId>`      — un gráfico por test del catálogo (`lib/store/catalogo.ts`).
 * - `resultado:<id>`     — gráficos derivados del motor de cálculo (`lib/calculations/`).
 *
 * No confundir con `lib/dashboard/metricas.ts`, que es el catálogo de la /dashboard
 * v2 (`dashboardMetricas`/`dashboardOrden`), todavía vivo hasta la FASE 4.
 */

export const RESULTADOS_DASHBOARD = [
  "cuadrante-fv",
  "acwr",
  "simetria",
  "carga",
  "dolor",
  "sesiones",
  "readiness",
] as const;

export type ResultadoDashboardId = (typeof RESULTADOS_DASHBOARD)[number];

export function graficoResultadoId(id: ResultadoDashboardId): string {
  return `resultado:${id}`;
}

export function graficoTestId(testId: string): string {
  return `test:${testId}`;
}

/**
 * Gráficos visibles por defecto. `resultado:cuadrante-fv` va SIEMPRE primero
 * (es la lectura de cabecera del dashboard v3).
 */
export const GRAFICOS_DASHBOARD_DEFECTO: string[] = [
  graficoResultadoId("cuadrante-fv"),
  graficoResultadoId("acwr"),
  graficoResultadoId("simetria"),
  graficoTestId("cmj"),
  graficoTestId("imtp"),
  graficoTestId("dinamometria-cuadriceps"),
  graficoTestId("nordic"),
  graficoTestId("single-hop"),
  graficoTestId("sprint-10m"),
];
