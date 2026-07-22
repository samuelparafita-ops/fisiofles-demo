/**
 * Catálogo de métricas de /dashboard (FASE E) — comparte esta lista el
 * selector de métricas, la semilla (`config.dashboardMetricas`/`dashboardOrden`
 * por defecto) y la página, para no duplicar los ids en varios sitios.
 */

export type MetricaDashboardId = "carga" | "acwr" | "simetria" | "dolor" | "sesiones";

export type MetricaDashboardDef = {
  id: MetricaDashboardId;
  label: string;
  descripcion: string;
};

export const METRICAS_DASHBOARD: MetricaDashboardDef[] = [
  { id: "carga", label: "Carga semanal (sRPE)", descripcion: "Suma de carga aguda de la plantilla activa por semana." },
  { id: "acwr", label: "ACWR", descripcion: "Media del ratio agudo:crónico de la plantilla activa, con bandas de riesgo." },
  { id: "simetria", label: "Simetría media", descripcion: "Media de simetría bilateral (LSI) interpolada entre tests." },
  { id: "dolor", label: "Dolor medio", descripcion: "Media de dolor (EVA 0-10) interpolada entre registros de evolución." },
  { id: "sesiones", label: "Sesiones completadas/semana", descripcion: "Nº de sesiones completadas por semana en la plantilla activa." },
];

export const METRICAS_DASHBOARD_IDS: MetricaDashboardId[] = METRICAS_DASHBOARD.map((m) => m.id);

export const RANGOS_SEMANAS = [4, 8, 12] as const;
export type RangoSemanas = (typeof RANGOS_SEMANAS)[number];
export const RANGO_SEMANAS_DEFECTO: RangoSemanas = 8;
