/**
 * Simetrías en test — índice de simetría bilateral.
 * Fórmula: docs/Fisiofles_Formulas_Dashboard.md, sección 4.
 *
 * Excepción documentada: "Hop Battery" y "SL DJ" no siempre salen de un simple
 * min/max de dos valores (baterías compuestas / base normativa distinta). Esta
 * función replica la fórmula estándar; para esos tests el % ya viene calculado
 * en los datos mock y no debe recalcularse con `simetria()`.
 */

export type EstadoSimetria = "deficit" | "aceptable" | "optimo";

export function simetria(izq: number, der: number): number {
  if (Math.max(izq, der) === 0) return 0;
  return (Math.min(izq, der) / Math.max(izq, der)) * 100;
}

export function estadoSimetria(pct: number): EstadoSimetria {
  if (pct < 85) return "deficit";
  if (pct < 90) return "aceptable";
  return "optimo";
}
