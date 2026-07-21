/**
 * Tabla de referencia (media y desviación típica por capacidad y sexo).
 * Fuente: docs/Fisiofles_Formulas_Dashboard.md, sección 1 ("VALORES GRAFICA RADIAL").
 * No modificar sin cotejar contra el Excel de origen.
 */

export type Sexo = "Hombre" | "Mujer";

export type RefValue = {
  media_h: number;
  desv_h: number;
  media_m: number;
  desv_m: number;
};

export type Capacidad = keyof typeof referencias;

export const referencias = {
  "Fuerza explosiva": { media_h: 38.6, desv_h: 3.5, media_m: 28.0, desv_m: 4.0 },
  "Altura salto CMJ": { media_h: 40.55, desv_h: 4.48, media_m: 31.0, desv_m: 4.0 },
  "Fuerza rápida": { media_h: 201.5, desv_h: 11.5, media_m: 159.0, desv_m: 10.0 },
  "Fuerza reactiva RSI mod": { media_h: 0.53, desv_h: 0.09, media_m: 0.4, desv_m: 0.08 },
  "Fuerza reactiva RSI": { media_h: 2.25, desv_h: 0.5, media_m: 1.85, desv_m: 0.3 },
  "Capacidad elástica": { media_h: 1.09, desv_h: 0.16, media_m: 1.1, desv_m: 0.21 },
  "Fuerza máxima": { media_h: 1.83, desv_h: 0.21, media_m: 1.16, desv_m: 0.18 },
  "Velocidad máxima": { media_h: 7.12, desv_h: 0.28, media_m: 5.76, desv_m: 0.2 },
  "Aceleración": { media_h: 2.99, desv_h: 0.03, media_m: 3.4, desv_m: 0.14 },
  "Agilidad-COD": { media_h: 2.413, desv_h: 0.128, media_m: 2.67, desv_m: 0.217 },
  "Cambio de dirección": { media_h: 0.481, desv_h: 0.107, media_m: 0.531, desv_m: 0.142 },
  "Deceleración": { media_h: 1.95, desv_h: 0.12, media_m: 3.34, desv_m: 0.32 },
  RSA: { media_h: 22.2, desv_h: 1.37, media_m: 17.3, desv_m: 1.04 },
} as const satisfies Record<string, RefValue>;
