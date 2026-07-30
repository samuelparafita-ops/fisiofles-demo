/**
 * Intensidad de una sesión — SIEMPRE calculada a partir del RPE objetivo,
 * NUNCA guardada (misma regla que el LSI, ver simetria.ts).
 */

export type IntensidadSesion = "low" | "moderate" | "high";

export type UmbralesIntensidad = { rpeLow: number; rpeHigh: number };

export function intensidadSesion(rpe: number, umbrales: UmbralesIntensidad): IntensidadSesion {
  if (rpe <= umbrales.rpeLow) return "low";
  if (rpe > umbrales.rpeHigh) return "high";
  return "moderate";
}
