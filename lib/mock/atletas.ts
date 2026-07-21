/**
 * Datos ficticios de atletas. Sin backend: esto es la única fuente de datos
 * de la demo. Los valores de perfilFisico/acwr/simetrias/evolucion son
 * BRUTOS (en las unidades de cada test/capacidad) — las fórmulas (z-score,
 * ACWR, LSI, etc.) se recalculan en render con `lib/calculations/`. No
 * pintar números fijos en los gráficos: leer siempre de aquí.
 */

import type { Capacidad, Sexo } from "@/lib/calculations";

export type Atleta = {
  id: string;
  nombre: string;
  deporte: string;
  lesion: string;
  fase: string;
  semanaProceso: number;
  avatarInitials: string;
  sexo: Sexo;
  /**
   * Perfil físico (radar). `inicial`/`actual` son valores BRUTOS de cada
   * capacidad (mismas unidades que `lib/calculations/referencias.ts`); el
   * componente los convierte a z-score. `objetivo` es la meta de RTP para
   * ese atleta/eje, ya en unidades de z-score (no se recalcula: es un
   * criterio clínico fijado por el fisio, no una medida bruta).
   */
  perfilFisico: { eje: Capacidad; inicial: number; actual: number; objetivo: number }[];
  /** Carga aguda semanal (sRPE), bruta. El componente calcula crónica/ratio/zona. */
  acwr: { semana: string; agudo: number }[];
  simetrias: { test: string; fecha: string; izq: number; der: number }[];
  evolucion: { fecha: string; dolor: number; carga: number; rpe: number }[];
};

const EJES_PERFIL_FISICO = [
  "Fuerza explosiva",
  "Altura salto CMJ",
  "Fuerza rápida",
  "Fuerza reactiva RSI",
  "Capacidad elástica",
  "Fuerza máxima",
  "Velocidad máxima",
  "Aceleración",
  "Agilidad-COD",
  "Cambio de dirección",
  "Deceleración",
  "RSA",
] as const;

export const atletas: Atleta[] = [
  {
    id: "marcos-vidal",
    nombre: "Marcos Vidal",
    deporte: "Fútbol",
    lesion: "Reconstrucción LCA rodilla izq.",
    fase: "Fase 3 · Readaptación al campo",
    semanaProceso: 14,
    avatarInitials: "MV",
    sexo: "Hombre",
    // Progreso claro vs. inicial, pero aún por debajo del objetivo de RTP en
    // cualidades reactivas/elásticas y en deceleración — perfil típico post-LCA.
    // (inicial/actual: valores brutos; objetivo: z-score meta de RTP, fijado
    // por el fisio, no una medida bruta más — ver tipo `Atleta`.)
    perfilFisico: [
      { eje: EJES_PERFIL_FISICO[0], inicial: 28.1, actual: 36.85, objetivo: 1.0 },
      { eje: EJES_PERFIL_FISICO[1], inicial: 24.87, actual: 33.83, objetivo: 0.5 },
      { eje: EJES_PERFIL_FISICO[2], inicial: 172.75, actual: 201.5, objetivo: 1.2 },
      { eje: EJES_PERFIL_FISICO[3], inicial: 0.25, actual: 0.85, objetivo: 0.8 },
      { eje: EJES_PERFIL_FISICO[4], inicial: 0.482, actual: 0.738, objetivo: 0.6 },
      { eje: EJES_PERFIL_FISICO[5], inicial: 1.41, actual: 1.998, objetivo: 1.5 },
      { eje: EJES_PERFIL_FISICO[6], inicial: 6.7, actual: 7.4, objetivo: 1.8 },
      { eje: EJES_PERFIL_FISICO[7], inicial: 2.936, actual: 3.008, objetivo: 1.6 },
      { eje: EJES_PERFIL_FISICO[8], inicial: 2.131, actual: 2.387, objetivo: 1.0 },
      { eje: EJES_PERFIL_FISICO[9], inicial: 0.213, actual: 0.427, objetivo: 0.9 },
      { eje: EJES_PERFIL_FISICO[10], inicial: 1.53, actual: 1.734, objetivo: 0.7 },
      { eje: EJES_PERFIL_FISICO[11], inicial: 20.83, actual: 23.844, objetivo: 1.9 },
    ],
    // Carga aguda semanal (sRPE), bruta. El componente calcula crónica/ratio/
    // zona con `lib/calculations/acwr.ts`: mayormente zona óptima, con pico
    // de riesgo en la semana actual (S14).
    acwr: [
      { semana: "S7", agudo: 520 },
      { semana: "S8", agudo: 560 },
      { semana: "S9", agudo: 600 },
      { semana: "S10", agudo: 580 },
      { semana: "S11", agudo: 610 },
      { semana: "S12", agudo: 640 },
      { semana: "S13", agudo: 670 },
      { semana: "S14", agudo: 980 },
    ],
    // Déficit visible en hop battery y SL DJ (lado operado, izq). El % se
    // calcula con `simetria()`, no se guarda aquí.
    simetrias: [
      { test: "Leg Curl", fecha: "2026-07-07", izq: 35.7, der: 42 },
      { test: "Leg Extension", fecha: "2026-07-07", izq: 45.7, der: 55 },
      { test: "Hop Battery", fecha: "2026-07-14", izq: 128.7, der: 195 },
      { test: "SL Drop Jump (RSI)", fecha: "2026-07-14", izq: 0.84, der: 1.35 },
    ],
    // Dolor bajando de 6 a 2, carga subiendo progresivamente.
    evolucion: [
      { fecha: "2026-06-02", dolor: 6, carga: 420, rpe: 5 },
      { fecha: "2026-06-09", dolor: 5, carga: 460, rpe: 6 },
      { fecha: "2026-06-16", dolor: 5, carga: 480, rpe: 6 },
      { fecha: "2026-06-23", dolor: 4, carga: 520, rpe: 6 },
      { fecha: "2026-06-30", dolor: 4, carga: 560, rpe: 7 },
      { fecha: "2026-07-07", dolor: 3, carga: 610, rpe: 7 },
      { fecha: "2026-07-14", dolor: 3, carga: 670, rpe: 7 },
      { fecha: "2026-07-21", dolor: 2, carga: 780, rpe: 8 },
    ],
  },
  {
    id: "laura-saez",
    nombre: "Laura Sáez",
    deporte: "Atletismo",
    lesion: "Tendinopatía aquílea",
    fase: "Fase 2 · Reintroducción a carrera",
    semanaProceso: 6,
    avatarInitials: "LS",
    sexo: "Mujer",
    // Fase temprana: progreso modesto, gap pequeño porque llevan solo 6 semanas.
    perfilFisico: [
      { eje: EJES_PERFIL_FISICO[0], inicial: 22, actual: 26, objetivo: 1.0 },
      { eje: EJES_PERFIL_FISICO[1], inicial: 27, actual: 29.8, objetivo: 1.2 },
      { eje: EJES_PERFIL_FISICO[2], inicial: 147, actual: 157, objetivo: 1.1 },
      { eje: EJES_PERFIL_FISICO[3], inicial: 1.1, actual: 1.31, objetivo: 1.0 },
      { eje: EJES_PERFIL_FISICO[4], inicial: 0.638, actual: 0.785, objetivo: 0.9 },
      { eje: EJES_PERFIL_FISICO[5], inicial: 0.98, actual: 1.16, objetivo: 1.3 },
      { eje: EJES_PERFIL_FISICO[6], inicial: 5.6, actual: 5.8, objetivo: 1.5 },
      { eje: EJES_PERFIL_FISICO[7], inicial: 3.19, actual: 3.316, objetivo: 1.2 },
      { eje: EJES_PERFIL_FISICO[8], inicial: 2.453, actual: 2.648, objetivo: 1.1 },
      { eje: EJES_PERFIL_FISICO[9], inicial: 0.361, actual: 0.503, objetivo: 1.0 },
      { eje: EJES_PERFIL_FISICO[10], inicial: 2.764, actual: 3.02, objetivo: 0.9 },
      { eje: EJES_PERFIL_FISICO[11], inicial: 16.78, actual: 17.82, objetivo: 1.6 },
    ],
    // Conservador, siempre en zona óptima.
    acwr: [
      { semana: "S1", agudo: 210 },
      { semana: "S2", agudo: 225 },
      { semana: "S3", agudo: 230 },
      { semana: "S4", agudo: 220 },
      { semana: "S5", agudo: 235 },
      { semana: "S6", agudo: 228 },
    ],
    // Simetrías ya por encima del 90%.
    simetrias: [
      { test: "Leg Curl", fecha: "2026-06-30", izq: 31.5, der: 34 },
      { test: "Leg Extension", fecha: "2026-06-30", izq: 37.2, der: 40 },
      { test: "Hop Battery", fecha: "2026-07-14", izq: 147.2, der: 160 },
      { test: "SL Drop Jump (RSI)", fecha: "2026-07-14", izq: 0.94, der: 1.05 },
    ],
    evolucion: [
      { fecha: "2026-06-16", dolor: 4, carga: 180, rpe: 4 },
      { fecha: "2026-06-23", dolor: 3, carga: 200, rpe: 5 },
      { fecha: "2026-06-30", dolor: 3, carga: 210, rpe: 5 },
      { fecha: "2026-07-07", dolor: 3, carga: 225, rpe: 5 },
      { fecha: "2026-07-14", dolor: 2, carga: 230, rpe: 6 },
      { fecha: "2026-07-21", dolor: 2, carga: 235, rpe: 6 },
    ],
  },
  {
    id: "diego-torres",
    nombre: "Diego Torres",
    deporte: "Baloncesto",
    lesion: "Esguince tobillo grado II",
    fase: "Fase 4 · Alta próxima",
    semanaProceso: 20,
    avatarInitials: "DT",
    sexo: "Hombre",
    // Casi de alta: actual igual o por encima del objetivo de RTP en casi todos los ejes.
    perfilFisico: [
      { eje: EJES_PERFIL_FISICO[0], inicial: 31.6, actual: 43.15, objetivo: 1.2 },
      { eje: EJES_PERFIL_FISICO[1], inicial: 29.35, actual: 45.03, objetivo: 1.0 },
      { eje: EJES_PERFIL_FISICO[2], inicial: 180.8, actual: 214.15, objetivo: 1.0 },
      { eje: EJES_PERFIL_FISICO[3], inicial: 0.75, actual: 2.7, objetivo: 1.1 },
      { eje: EJES_PERFIL_FISICO[4], inicial: 0.642, actual: 1.25, objetivo: 1.0 },
      { eje: EJES_PERFIL_FISICO[5], inicial: 1.515, actual: 2.124, objetivo: 1.3 },
      { eje: EJES_PERFIL_FISICO[6], inicial: 6.84, actual: 7.624, objetivo: 1.7 },
      { eje: EJES_PERFIL_FISICO[7], inicial: 2.954, actual: 3.038, objetivo: 1.6 },
      { eje: EJES_PERFIL_FISICO[8], inicial: 2.131, actual: 2.541, objetivo: 1.1 },
      { eje: EJES_PERFIL_FISICO[9], inicial: 0.267, actual: 0.577, objetivo: 1.1 },
      { eje: EJES_PERFIL_FISICO[10], inicial: 1.65, actual: 2.046, objetivo: 1.0 },
      { eje: EJES_PERFIL_FISICO[11], inicial: 21.104, actual: 24.803, objetivo: 1.8 },
    ],
    // Óptimo y estable, semanas finales del proceso.
    acwr: [
      { semana: "S13", agudo: 700 },
      { semana: "S14", agudo: 710 },
      { semana: "S15", agudo: 695 },
      { semana: "S16", agudo: 720 },
      { semana: "S17", agudo: 715 },
      { semana: "S18", agudo: 730 },
      { semana: "S19", agudo: 725 },
      { semana: "S20", agudo: 718 },
    ],
    // Simetrías 92-98%, lado afectado el derecho.
    simetrias: [
      { test: "Leg Curl", fecha: "2026-07-07", izq: 45, der: 44.1 },
      { test: "Leg Extension", fecha: "2026-07-07", izq: 58, der: 55.1 },
      { test: "Hop Battery", fecha: "2026-07-21", izq: 205, der: 188.6 },
      { test: "SL Drop Jump (RSI)", fecha: "2026-07-21", izq: 1.45, der: 1.38 },
    ],
    // Dolor prácticamente en 0, carga estable en niveles de competición.
    evolucion: [
      { fecha: "2026-06-02", dolor: 2, carga: 650, rpe: 6 },
      { fecha: "2026-06-09", dolor: 2, carga: 670, rpe: 6 },
      { fecha: "2026-06-16", dolor: 1, carga: 690, rpe: 6 },
      { fecha: "2026-06-23", dolor: 1, carga: 700, rpe: 7 },
      { fecha: "2026-06-30", dolor: 1, carga: 710, rpe: 7 },
      { fecha: "2026-07-07", dolor: 0, carga: 715, rpe: 7 },
      { fecha: "2026-07-14", dolor: 0, carga: 720, rpe: 6 },
      { fecha: "2026-07-21", dolor: 0, carga: 718, rpe: 6 },
    ],
  },
];

export function getAtleta(id: string): Atleta | undefined {
  return atletas.find((a) => a.id === id);
}
