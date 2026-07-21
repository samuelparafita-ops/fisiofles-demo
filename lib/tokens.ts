/**
 * Design tokens — UI clara, paneles de gráfico oscuros ("cockpit").
 *
 * Fuente de verdad para colores fuera de Tailwind (Recharts, inline styles).
 * Extraídos con exactitud de la hoja de cálculo real del producto (perfil
 * físico, ACWR, simetrías). Los mismos valores están espejados como CSS vars
 * en app/globals.css y como colores custom en tailwind.config.ts. Si cambias
 * un valor aquí, cambia también el equivalente en ambos.
 *
 * `data.*` son colores PUROS del Excel: úsalos SOLO dentro de paneles de
 * gráfico oscuros (sobre `chartBg`), nunca en superficies o texto general —
 * sobre fondo claro no tienen contraste suficiente y fatigan la vista.
 * `brand` es para acentos grandes / estado activo / panel oscuro; para texto
 * y enlaces cyan sobre fondo claro usa `brandInk`, que sí contrasta.
 */

export const colors = {
  // Marca
  brand: "#1DC4EB", // cyan · acento grande, estado activo, serie principal en panel oscuro
  brandLight: "#67DBF6", // cyan claro · hover
  brandTint: "#E7F8FD", // cyan muy claro · fondo de item de nav activo, chips
  brandInk: "#0B96B8", // cyan oscuro · TEXTO y enlaces cyan sobre fondo claro (contrasta)
  brandDeep: "#0062FF", // azul · botones CTA (texto blanco encima)

  // Datos — PUROS del Excel. SOLO dentro de paneles oscuros de gráfico (sobre chartBg).
  data: {
    primary: "#1DC4EB", // serie "actual" / principal
    compare: "#FF0000", // comparación / lado con déficit
    good: "#00FF44", // zona óptima
    warn: "#FF9900", // riesgo moderado
    base: "#B7B7B7", // serie "base" de referencia (punteada)
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
