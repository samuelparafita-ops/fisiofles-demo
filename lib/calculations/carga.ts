/**
 * Carga externa vs interna (por semana).
 * Fórmula: docs/Fisiofles_Formulas_Dashboard.md, sección 2.
 */

export type Sesion = { rpe: number; duracionMin: number };

/** sRPE: suma de (RPE × duración) de cada sesión de la semana. */
export function cargaInterna(sesiones: Sesion[]): number {
  return sesiones.reduce((acc, s) => acc + s.rpe * s.duracionMin, 0);
}

export function cargaExterna(volumenSemanal: number, intensidadMedia: number): number {
  return volumenSemanal * intensidadMedia;
}
