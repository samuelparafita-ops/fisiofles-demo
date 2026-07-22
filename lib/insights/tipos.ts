/**
 * Motor de hallazgos — funciones puras y testeadas (mismo estándar que
 * `lib/calculations/`). Lenguaje siempre descriptivo, nunca prescriptivo:
 * "el ACWR ha entrado en zona de riesgo (1.42)" sí, "reduce la carga" no.
 * La app muestra, el profesional decide.
 */

export type SeveridadHallazgo = "info" | "atencion" | "critico";

export type Hallazgo = {
  id: string;
  atletaId: string;
  severidad: SeveridadHallazgo;
  titulo: string;
  detalle: string;
  fecha: string;
  enlace: string;
};
