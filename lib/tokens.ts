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
 * defecto, y "oscuro" sobre superficies oscuras) — ver `lib/theme.ts`
 * `useChartColors()`. Ningún gráfico debe importar `data.*` directamente:
 * todos consumen colores vía ese hook.
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
