import type { UmbralesConfig } from "@/lib/store/types";

/**
 * Únicos valores por defecto de `config.umbrales` — antes vivían solo
 * hardcodeados en `lib/mock/seed.ts`; ahora también los usa el botón
 * "Restaurar valores por defecto" de Personalización > Variables de cálculo,
 * así que hace falta una sola fuente. Estos umbrales alimentan de verdad las
 * bandas de ACWR/simetría de los gráficos y el motor de hallazgos (ver
 * `lib/insights/`) — nunca son un valor decorativo.
 */
export const UMBRALES_DEFECTO: UmbralesConfig = {
  acwrBajo: 0.8,
  acwrAlto: 1.3,
  simetriaObjetivo: 90,
  simetriaAceptable: 85,
  dolorAlerta: 5,
};

export type UmbralDef = {
  key: keyof UmbralesConfig;
  label: string;
  descripcion: string;
  unidad?: string;
  min: number;
  max: number;
  step: number;
};

export const UMBRALES_DEFS: UmbralDef[] = [
  {
    key: "acwrBajo",
    label: "ACWR bajo",
    descripcion: "Por debajo de este ratio agudo:crónico, la carga se marca como insuficiente para mantener la adaptación.",
    min: 0.3,
    max: 1.5,
    step: 0.05,
  },
  {
    key: "acwrAlto",
    label: "ACWR alto",
    descripcion: "Por encima de este ratio, la carga se marca como zona de riesgo de sobrecarga.",
    min: 1.0,
    max: 2.5,
    step: 0.05,
  },
  {
    key: "simetriaObjetivo",
    label: "Simetría objetivo",
    descripcion: "Índice de simetría bilateral (LSI) que se considera óptimo entre lado sano y lado afectado.",
    unidad: "%",
    min: 70,
    max: 100,
    step: 1,
  },
  {
    key: "simetriaAceptable",
    label: "Simetría aceptable",
    descripcion: "Umbral mínimo por debajo del cual la simetría se marca como déficit relevante.",
    unidad: "%",
    min: 50,
    max: 100,
    step: 1,
  },
  {
    key: "dolorAlerta",
    label: "Umbral de alerta de dolor",
    descripcion: "Dolor (escala EVA 0–10) a partir del cual se genera un hallazgo de atención.",
    min: 1,
    max: 10,
    step: 1,
  },
];
