/**
 * Catálogo de los 4 gráficos del tab "Datos" de la ficha de atleta — comparte
 * esta lista Personalización (visibilidad/orden) y `TabDatos`
 * (components/atletas/ficha/tab-datos.tsx), que ya lee
 * `config.metricasVisiblesDashboard`/`ordenDashboard` (fases A/C). No
 * confundir con `lib/dashboard/metricas.ts`, que es el catálogo de /dashboard
 * (agregado de plantilla), un config distinto (`dashboardMetricas`/`dashboardOrden`).
 */

export type PanelFichaId = "perfil-fisico" | "acwr" | "simetrias" | "evolucion";

export type PanelFichaDef = {
  id: PanelFichaId;
  label: string;
  descripcion: string;
};

export const PANELES_FICHA: PanelFichaDef[] = [
  { id: "perfil-fisico", label: "Perfil físico", descripcion: "Radar de 12 capacidades vs. población de referencia (z-score)." },
  { id: "acwr", label: "ACWR", descripcion: "Ratio agudo:crónico con bandas de riesgo, media móvil de 4 semanas." },
  { id: "simetrias", label: "Simetrías en test", descripcion: "Índice de simetría bilateral (LSI) por test registrado." },
  { id: "evolucion", label: "Evolución", descripcion: "Dolor, carga percibida y RPE por sesión." },
];

export const PANELES_FICHA_IDS: PanelFichaId[] = PANELES_FICHA.map((p) => p.id);
