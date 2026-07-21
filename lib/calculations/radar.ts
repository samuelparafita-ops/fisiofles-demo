/**
 * Perfil físico (radar) — z-score normalizado por capacidad y sexo.
 * Fórmula: docs/Fisiofles_Formulas_Dashboard.md, sección 1.
 */

import { referencias, type Capacidad, type Sexo } from "./referencias";

export function zScore(capacidad: Capacidad, valor: number, sexo: Sexo): number {
  const r = referencias[capacidad];
  const media = sexo === "Hombre" ? r.media_h : r.media_m;
  const desv = sexo === "Hombre" ? r.desv_h : r.desv_m;
  return (valor - media) / desv;
}

export type PerfilRadarPunto = {
  eje: Capacidad;
  inicial: number;
  actual: number;
  base: number;
};

/**
 * Convierte valores brutos (inicial/actual) a las 3 series del radar.
 * El orden de los ejes sigue el orden de `referencias` (el del Excel).
 */
export function perfilRadar(
  valoresIniciales: Partial<Record<Capacidad, number>>,
  valoresActuales: Partial<Record<Capacidad, number>>,
  sexo: Sexo
): PerfilRadarPunto[] {
  return (Object.keys(referencias) as Capacidad[])
    .filter((capacidad) => capacidad in valoresIniciales)
    .map((capacidad) => {
      const valorInicial = valoresIniciales[capacidad];
      const valorActual = valoresActuales[capacidad];
      if (valorInicial === undefined || valorActual === undefined) {
        throw new Error(`Falta valor para "${capacidad}" en inicial o actual`);
      }
      return {
        eje: capacidad,
        inicial: zScore(capacidad, valorInicial, sexo),
        actual: zScore(capacidad, valorActual, sexo),
        base: 0,
      };
    });
}
