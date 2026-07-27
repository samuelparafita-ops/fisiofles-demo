/**
 * Ids de los gráficos del dashboard v3 — los comparten `config.dashboardGraficos`
 * / `dashboardGraficosOrden` (semilla y Personalización) y la página de dashboard.
 * Dos familias:
 * - `test:<testId>`      — un gráfico por test del catálogo (`lib/store/catalogo.ts`).
 * - `resultado:<id>`     — gráficos derivados del motor de cálculo (`lib/calculations/`).
 *
 * `catalogoGraficos()` (FASE 3) construye la lista completa de `GraficoDef` —
 * metadatos consumidos por `GraficoTest` (`components/charts/grafico-test.tsx`)
 * para elegir variable por defecto y componente de render. Sustituye
 * conceptualmente a `lib/dashboard/metricas.ts`, que se retira en la FASE 4.
 */

import type { TestDef } from "@/lib/store/types";

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

// ---------------------------------------------------------------------------
// Catálogo de gráficos (FASE 3) — GraficoDef por test + por resultado.
// ---------------------------------------------------------------------------

export type TipoGrafico = "barras" | "linea" | "dispersion" | "radial";

export type VariableGrafico = { id: string; nombre: string; unidad: string };

export type GraficoDef = {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: TipoGrafico;
  origen: "test" | "resultado";
  /** Presente solo cuando `origen === "test"`. */
  testId?: string;
  /** Desplegable de variable del gráfico — vacío en los `resultado` sin variable seleccionable. */
  variables: VariableGrafico[];
  /** Id de la variable preseleccionada; `""` si `variables` está vacío. */
  variablePorDefecto: string;
};

function esVariableLsi(v: VariableGrafico): boolean {
  return v.nombre === "LSI" && v.unidad === "%";
}

/**
 * En tests `unilateral-lsi` la variable por defecto es SIEMPRE "LSI (%)" (el
 * criterio clínico de estos tests — déficit bilateral), calculada en render
 * con `lib/calculations/simetria` a partir de izq/der (ver `serieTest` en
 * `lib/dashboard/series-tests.ts`). El resto de tests usa su primera variable
 * del CSV (orden ya estable — ver `lib/store/catalogo.ts`).
 */
function variablePorDefectoDeTest(test: TestDef): string {
  if (test.tipo === "unilateral-lsi") {
    const lsi = test.variables.find(esVariableLsi);
    if (lsi) return lsi.id;
  }
  return test.variables[0]?.id ?? "";
}

function descripcionDeTest(test: TestDef): string {
  switch (test.tipo) {
    case "unilateral-lsi":
      return "Índice de simetría bilateral (LSI) y valor bruto, por semana.";
    case "cuestionario-pro":
      return "Puntuación del cuestionario, por semana.";
    default:
      return "Resultado del test por semana — variable seleccionable.";
  }
}

function graficoDeTest(test: TestDef): GraficoDef {
  return {
    id: graficoTestId(test.id),
    titulo: test.nombre,
    descripcion: descripcionDeTest(test),
    // Prioridad del cliente: TODO gráfico de test es de barras por defecto,
    // sin excepción — incluidos los cuestionarios PRO (ver brief FASE 3).
    tipo: "barras",
    origen: "test",
    testId: test.id,
    variables: test.variables.map((v) => ({ id: v.id, nombre: v.nombre, unidad: v.unidad })),
    variablePorDefecto: variablePorDefectoDeTest(test),
  };
}

type DefResultado = Omit<GraficoDef, "id" | "origen" | "testId">;

/**
 * Metadatos de los 7 `resultado:*` — reutilizan las series ya existentes de
 * `lib/dashboard/series.ts` (o, para `cuadrante-fv`, las nuevas de
 * `lib/dashboard/series-tests.ts`). Su render concreto en `/dashboard` llega
 * en la FASE 4; aquí solo se fija el catálogo (título/tipo/descripción).
 */
const GRAFICOS_RESULTADO: Record<ResultadoDashboardId, DefResultado> = {
  "cuadrante-fv": {
    titulo: "Cuadrante fuerza-velocidad",
    descripcion:
      "IMTP · Fuerza relativa (N/kg) vs. Velocidad máxima · Vmax (m/s) — cuadrantes por mediana del equipo.",
    tipo: "dispersion",
    variables: [],
    variablePorDefecto: "",
  },
  acwr: {
    titulo: "ACWR · agudo:crónico",
    descripcion: "Media del ratio agudo:crónico de la plantilla activa, con bandas de riesgo.",
    tipo: "linea",
    variables: [],
    variablePorDefecto: "",
  },
  simetria: {
    titulo: "Simetría media",
    descripcion: "Media de simetría bilateral (LSI) interpolada entre tests, por atleta.",
    tipo: "barras",
    variables: [],
    variablePorDefecto: "",
  },
  carga: {
    titulo: "Carga semanal (sRPE)",
    descripcion: "Suma de carga aguda de la plantilla activa por semana.",
    tipo: "barras",
    variables: [],
    variablePorDefecto: "",
  },
  dolor: {
    titulo: "Dolor medio",
    descripcion: "Media de dolor (EVA 0-10) interpolada entre registros de evolución.",
    tipo: "linea",
    variables: [],
    variablePorDefecto: "",
  },
  sesiones: {
    titulo: "Sesiones completadas",
    descripcion: "Nº de sesiones completadas por semana en la plantilla activa.",
    tipo: "barras",
    variables: [],
    variablePorDefecto: "",
  },
  readiness: {
    titulo: "Readiness del equipo",
    descripcion: "Media de readiness (0–10) del equipo — últimos valores de evolución, por atleta.",
    tipo: "linea",
    variables: [],
    variablePorDefecto: "",
  },
};

/**
 * Catálogo completo de `GraficoDef`: los 7 `resultado:*` (orden fijo,
 * `cuadrante-fv` primero) seguidos de un `test:<id>` por cada test del
 * catálogo, en su orden del CSV.
 */
export function catalogoGraficos(catalogoTests: TestDef[]): GraficoDef[] {
  const resultados: GraficoDef[] = RESULTADOS_DASHBOARD.map((resultadoId) => ({
    id: graficoResultadoId(resultadoId),
    origen: "resultado",
    ...GRAFICOS_RESULTADO[resultadoId],
  }));
  return [...resultados, ...catalogoTests.map(graficoDeTest)];
}
