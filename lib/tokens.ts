/**
 * Design tokens — UI clara. Los gráficos apoyan directamente sobre superficie
 * clara (ver ChartPanel v2); ya no hay panel "cockpit" oscuro por defecto.
 *
 * Fuente de verdad para colores fuera de Tailwind (Recharts, inline styles).
 * Extraídos con exactitud de la hoja de cálculo real del producto (perfil
 * físico, ACWR, simetrías). Los mismos valores están espejados como CSS vars
 * en app/globals.css y como colores custom en tailwind.config.ts. Si cambias
 * un valor aquí, cambia también el equivalente en ambos.
 *
 * `data.*` son colores PUROS del Excel: viven SOLO dentro del tema
 * "clasico-excel" (panel oscuro `chartBg`, activable desde Personalización);
 * sobre fondo claro no tienen contraste suficiente y fatigan la vista.
 * `dataLight.*` es la paleta de datos para fondo claro (tema "fisiofles" por
 * defecto). `dataDark.*` es su equivalente para el tema "oscuro" (mismos 5
 * roles, tonos claros-saturados legibles sobre `colorsDark.surface`). Ambas
 * vía `lib/theme.ts` `useChartColors()`. Ningún gráfico debe importar
 * `data.*`/`dataLight.*`/`dataDark.*` directamente: todos consumen colores
 * vía ese hook.
 * `brand` es para acentos grandes / estado activo / panel oscuro; para texto
 * y enlaces cyan sobre fondo claro usa `brandInk`, que sí contrasta. `brand`
 * tampoco sirve para trazos/líneas de gráfico sobre blanco (~2:1, no pasa
 * AA) — ahí usa `dataLight.primary` vía el hook.
 */

export const colors = {
  // Marca
  brand: "#1DC4EB", // cyan · acento grande, estado activo, serie principal en panel oscuro
  brandLight: "#67DBF6", // cyan claro · hover
  brandTint: "#E7F8FD", // cyan muy claro · fondo de item de nav activo, chips
  brandInk: "#0B96B8", // cyan oscuro · TEXTO y enlaces cyan sobre fondo claro (contrasta)
  brandDeep: "#0062FF", // azul · botones CTA (texto blanco encima)

  // Datos — PUROS del Excel. SOLO dentro del tema "clasico-excel" (panel chartBg).
  data: {
    primary: "#1DC4EB", // serie "actual" / principal
    compare: "#FF0000", // comparación / lado con déficit
    good: "#00FF44", // zona óptima
    warn: "#FF9900", // riesgo moderado
    base: "#B7B7B7", // serie "base" de referencia (punteada)
  },

  // Datos — paleta para FONDO CLARO (tema "fisiofles" por defecto). Deriva de
  // los mismos matices que `data.*` pero con luminosidad que contrasta AA
  // sobre blanco. Acceder siempre vía `useChartColors()` (lib/theme.ts).
  dataLight: {
    primary: "#0891B2", // cyan legible sobre blanco (~3.7:1) — sustituye #1DC4EB como serie
    compare: "#DC2626", // rojo (~4.8:1)
    good: "#16A34A", // verde (~3.3:1)
    warn: "#D97706", // naranja (~3.2:1)
    // gris de referencia: el tono #94A3B8 propuesto en el mismo escalón que
    // el resto (Tailwind slate-400) solo da ~2.6:1 sobre blanco y no pasa el
    // mínimo AA de objetos gráficos (3:1) — se usa slate-500 (~4.8:1).
    base: "#64748B",
  },

  // Datos — paleta para FONDO OSCURO (tema "oscuro"). Mismos 5 roles que
  // `dataLight`, en versión clara-saturada: sobre `colorsDark.surface`
  // (#161B22) los tonos de `dataLight` (pensados para contrastar en blanco)
  // pierden legibilidad. Verificado ≥6:1 los 5 (líneas/texto) salvo `base`
  // (~6.6:1, de sobra para trazos de referencia). Acceder vía
  // `useChartColors()` (lib/theme.ts), igual que `dataLight`.
  dataDark: {
    primary: "#22D3EE", // cyan claro (~9.3:1 sobre #161B22)
    compare: "#F87171", // rojo claro (~6.1:1)
    good: "#4ADE80", // verde claro (~9.7:1)
    warn: "#FBBF24", // ámbar claro (~10.1:1)
    base: "#94A3B8", // gris claro (~6.6:1)
  },

  // Semáforo de fases de lesión (lib/calculations/semaforo.ts) — continuum
  // rojo (fase más temprana) → verde fosforito (fase final / rendimiento),
  // interpolado en HSL. Únicos hex de este continuum: nadie más los importa
  // directamente, siempre a través de `colorSemaforo`/`colorSemaforoTexto`.
  semaforo: {
    inicio: "#980000",
    fin: "#8BF200",
  },

  // Paleta de comparación (Dashboard /dashboard FASE E; motor de gráficos por
  // test FASE 3) — atletas superpuestos sobre la serie agregada gris o
  // resaltados en barras/dispersión, sin tope de cantidad (FASE 3: del 7º en
  // adelante se generan más tonos por rotación HSL, ver
  // `useComparisonColorsExtended` en lib/theme.ts). Deliberadamente fuera de
  // la familia semántica rojo/verde/naranja de `dataLight` (reservada para
  // zonas de estado) y del cyan de `dataLight.primary`, para que un atleta
  // seleccionado nunca se confunda con una banda de estado. Los 6 contrastan
  // ≥4.5:1 sobre blanco y son distinguibles entre sí. Acceder siempre vía
  // `useComparisonColorsExtended()` (lib/theme.ts).
  comparison: ["#2563EB", "#7C3AED", "#DB2777", "#0F766E", "#92400E", "#475569"],

  // Superficie oscura de los gráficos (el "cockpit")
  chartBg: "#181C20", // fondo de los paneles de gráfico
  chartGrid: "#2E343A", // gridlines dentro del panel oscuro
  chartText: "#C9CED4", // etiquetas de eje dentro del panel oscuro

  // Estados — para badges y texto de estado sobre fondo CLARO (contraste verificado)
  state: {
    good: "#15803D",
    warn: "#B45309",
    bad: "#DC2626",
  },

  // Estados — misma semántica que `state.*` pero tonos de `dataDark` (ya
  // verificados ≥6:1 sobre `colorsDark.surface`): los tonos de `state.*` se
  // eligieron oscuros a propósito para contrastar en BLANCO, así que pierden
  // legibilidad sobre superficie oscura. Acceder vía `useStateColors()`
  // (lib/theme.ts) donde un estado se pinta con `style` inline (icono/badge
  // de hallazgo, hito, notificación...). No se usa en gráficos: eso ya lo
  // cubre `dataDark` vía `useChartColors()`.
  stateDark: {
    good: "#4ADE80",
    warn: "#FBBF24",
    bad: "#F87171",
  },

  // Neutros — base CLARA
  bg: "#F6F7F9", // fondo de página
  surface1: "#FFFFFF", // sidebar, superficies
  surface2: "#FFFFFF", // cards (con borde + sombra sutil para separar del bg)
  border: "#E3E6EA", // bordes, divisores
  borderSoft: "#EEF0F3", // divisores sutiles
  muted: "#8B929B", // texto tenue, iconos secundarios
  textDim: "#5B626B", // texto secundario
  text: "#232830", // texto principal
  textStrong: "#0D1117", // titulares, números destacados
} as const;

export const fonts = {
  display: "var(--font-display)", // Space Grotesk — h1-h3, números de métricas, datos grandes
  sans: "var(--font-sans)", // Inter — el resto
} as const;

/**
 * Subconjunto de `colors` para tema "Oscuro" en props INLINE de Recharts
 * (grid/eje/cursor de tooltip) — el SVG de Recharts no puede leer las clases
 * Tailwind `bg-surface2`/`border-borderSoft` que sí resuelven el resto de la
 * UI vía CSS var (`app/globals.css` `.dark`); necesita un color final. NO
 * usar directamente: siempre a través de `useChartGridColors()`
 * (lib/theme.ts), igual que "clasico-excel" usa `chartGrid`/`chartText` de
 * arriba. `bg`/`surface2`/`textStrong` etc. NO hacen falta aquí porque esos
 * sí llegan a los gráficos vía clases Tailwind (ChartPanel, ChartTooltipBox).
 */
export const colorsDark = {
  border: "#3A424D",
  borderSoft: "#242B34",
  textDim: "#ADB4BE",
  // Fondo/superficie del tema "Oscuro" — espejo EXACTO de app/globals.css
  // `.dark` (--background/--surface). Solo como literal donde no llega la CSS
  // var: el preview de temas de Personalización pinta los 3 temas a la vez sin
  // activar ninguno (ver components/personalizacion/seccion-apariencia.tsx).
  bg: "#0D1116",
  surface: "#161B22",
} as const;
