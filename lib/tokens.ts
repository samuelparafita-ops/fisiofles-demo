/**
 * Design tokens — rediseño 2026-07 «estándar premium del sector».
 * Listón de acabado: VALD Hub (encarnación clara) y Whoop (encarnación
 * oscura). Un solo sistema, dos temas gemelos al mismo nivel; el tema
 * "clasico-excel" se retiró en este rediseño.
 *
 * Fuente de verdad para colores fuera de Tailwind (Recharts, inline styles).
 * Espejados como CSS vars en app/globals.css y como colores custom en
 * tailwind.config.ts: si cambias un valor aquí, cambia el equivalente en
 * ambos.
 *
 * `dataLight.*` es la paleta de datos para el tema claro; `dataDark.*` su
 * gemela para el oscuro (mismos 5 roles). Ambas SOLO vía `useChartColors()`
 * (lib/theme.ts); ningún gráfico importa estas paletas directamente.
 *
 * `brand` (#1DC4EB) es el cyan identidad: acentos grandes, estado activo,
 * fills sobre superficies oscuras (rail/tema oscuro). Sobre fondo claro NO
 * contrasta para texto ni trazos (~2:1): ahí se usa `brandInk` (≥4.5:1
 * incluso sobre `bg`) o `dataLight.primary` vía hook.
 */

export const colors = {
  // Marca — rampa cyan de un solo matiz. brandDeep (#0062FF) se retiró:
  // los CTA usan brandInk para no mezclar dos azules sin relación.
  brand: "#1DC4EB", // cyan identidad · fills, activo sobre oscuro, serie en tema oscuro
  brandInk: "#077596", // cyan tinta · texto/enlaces/CTA sobre claro (5.3:1 blanco, 4.6:1 bg)
  brandTint: "#E3F6FC", // lavado cyan · chips/hover/nav activo en claro

  // Datos — tema CLARO. AA sobre blanco (objetos gráficos ≥3:1, texto ≥4.5:1
  // donde aplica). Acceso vía `useChartColors()`.
  dataLight: {
    primary: "#0891B2", // serie principal
    compare: "#DC2626", // comparación / lado con déficit
    good: "#16A34A", // zona óptima
    warn: "#D97706", // riesgo moderado
    base: "#64748B", // serie de referencia (punteada)
  },

  // Datos — tema OSCURO. Mismos 5 roles, verificados ≥6:1 sobre
  // `colorsDark.surface`. Acceso vía `useChartColors()`.
  dataDark: {
    primary: "#22D3EE",
    compare: "#F87171",
    good: "#4ADE80",
    warn: "#FBBF24",
    base: "#94A3B8",
  },

  // Semáforo de fases de lesión (lib/calculations/semaforo.ts) — continuum
  // rojo→verde interpolado en HSL. Únicos hex del continuum; siempre a
  // través de `colorSemaforo`/`colorSemaforoTexto`.
  semaforo: {
    inicio: "#980000",
    fin: "#8BF200",
  },

  // Paleta de comparación (Dashboard FASE E; gráficos por test FASE 3) —
  // fuera de la familia semántica y del cyan. ≥4.5:1 sobre blanco.
  // Acceso vía `useComparisonColorsExtended()` (lib/theme.ts).
  comparison: ["#2563EB", "#7C3AED", "#DB2777", "#0F766E", "#92400E", "#475569"],

  // Estados — badges/texto de estado sobre fondo CLARO (AA verificado).
  state: {
    good: "#15803D",
    warn: "#B45309",
    bad: "#DC2626",
  },

  // Estados — gemelo para superficie OSCURA (≥6:1 sobre colorsDark.surface).
  // Acceso vía `useStateColors()` donde el estado se pinta inline.
  stateDark: {
    good: "#4ADE80",
    warn: "#FBBF24",
    bad: "#F87171",
  },

  // Neutros — tema CLARO. El fondo baja un punto respecto al blanco de las
  // cards para que la elevación sea real (sombra + salto de valor), no un
  // borde dibujado sobre blanco-sobre-blanco.
  bg: "#EEF1F5", // fondo de página
  surface1: "#FFFFFF", // sidebar móvil, superficies, cards
  surface2: "#FFFFFF", // cards (elevadas con shadow-card)
  surfaceRaised: "#F6F8FA", // hover de fila, celda activa, inputs rellenos
  border: "#DFE4EA", // bordes, divisores
  borderSoft: "#EAEEF2", // divisores sutiles
  muted: "#68737F", // texto tenue SOLO sobre surface (4.8:1 blanco)
  textDim: "#49525D", // texto secundario (7.9:1)
  text: "#1D242D", // texto principal
  textStrong: "#0A101A", // titulares, números destacados
} as const;

export const fonts = {
  display: "var(--font-display)", // Archivo — h1-h3, números de métricas, datos grandes
  sans: "var(--font-sans)", // Inter — el resto
} as const;

/**
 * Neutros del tema OSCURO — espejo EXACTO de app/globals.css `.dark`. Como
 * literal solo donde no llega la CSS var: props inline de Recharts
 * (vía `useChartGridColors()`) y el preview de temas de Personalización.
 */
export const colorsDark = {
  bg: "#0A0E14",
  surface: "#11161E",
  surfaceRaised: "#171D26",
  border: "#29313C",
  borderSoft: "#1D242E",
  muted: "#8C96A3",
  textDim: "#B3BAC4",
  text: "#E4E8ED",
  textStrong: "#F7F9FB",
} as const;

/**
 * Rail de navegación — carbón constante en AMBOS temas (firma del rediseño:
 * la marca vive en el rail; el contenido cambia de tema, el rail no).
 * Espejo de las vars `--rail-*` de app/globals.css.
 */
export const rail = {
  bg: "#0B1017",
  hover: "#141A23",
  border: "#1E2530",
  muted: "#98A1AE", // 7.3:1 sobre rail.bg
  text: "#E7EAEF", // 15.8:1
} as const;
