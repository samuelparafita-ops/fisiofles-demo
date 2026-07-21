/**
 * Programación semanal ya asignada a un atleta. Solo lectura en esta fase:
 * vende la capacidad de planificación sin construir el editor. Referencia
 * ejercicios por `ejercicioId` contra `lib/mock/ejercicios.ts`.
 */

import type { VariableMedible } from "./ejercicios";

export type EjercicioProgramado = {
  ejercicioId: string;
  series: number;
  repeticiones: string;
  carga: string;
  variablesAMedir: VariableMedible[];
  notas?: string;
};

export const DIAS_SEMANA = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
] as const;
export type DiaSemana = (typeof DIAS_SEMANA)[number];

export type Sesion = {
  id: string;
  dia: DiaSemana;
  nombre: string;
  ejercicios: EjercicioProgramado[];
};

export type BloqueSemanal = {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  objetivo: string;
  sesiones: Sesion[];
};

export type Programacion = {
  atletaId: string;
  bloques: BloqueSemanal[];
};

export const programaciones: Programacion[] = [
  {
    atletaId: "marcos-vidal",
    bloques: [
      {
        id: "marcos-s14",
        nombre: "Semana 14 · Readaptación al campo",
        fechaInicio: "2026-07-20",
        fechaFin: "2026-07-26",
        objetivo:
          "Progresar la carga en tren inferior y reintroducir gestos pliométricos y de campo, manteniendo el control del dolor y verificando simetría antes de aumentar la exposición a cambios de dirección.",
        sesiones: [
          {
            id: "marcos-s14-lunes",
            dia: "Lunes",
            nombre: "Fuerza tren inferior",
            ejercicios: [
              {
                ejercicioId: "sentadilla-bulgara",
                series: 4,
                repeticiones: "8",
                carga: "16 kg / mano",
                variablesAMedir: ["Carga", "RPE", "Dolor EVA"],
                notas: "Controlar el valgo de rodilla en la fase excéntrica.",
              },
              {
                ejercicioId: "peso-muerto-rumano-una-pierna",
                series: 3,
                repeticiones: "10",
                carga: "12 kg",
                variablesAMedir: ["Carga", "RPE"],
              },
              {
                ejercicioId: "elevacion-talones-unilateral",
                series: 3,
                repeticiones: "15",
                carga: "Peso corporal + 5 kg",
                variablesAMedir: ["Repeticiones", "Carga", "RPE"],
              },
              {
                ejercicioId: "nordic-curl",
                series: 3,
                repeticiones: "6",
                carga: "Peso corporal (asistido con banda)",
                variablesAMedir: ["Repeticiones", "RPE", "Dolor EVA"],
                notas: "Detener la serie si el dolor EVA supera 3/10.",
              },
            ],
          },
          {
            id: "marcos-s14-miercoles",
            dia: "Miércoles",
            nombre: "Pliometría y control neuromuscular",
            ejercicios: [
              {
                ejercicioId: "cmj",
                series: 4,
                repeticiones: "3 saltos",
                carga: "Peso corporal",
                variablesAMedir: ["Altura", "RPE"],
                notas: "Registrar la altura media de cada serie.",
              },
              {
                ejercicioId: "perturbaciones-tabla-equilibrio",
                series: 3,
                repeticiones: "30 s",
                carga: "—",
                variablesAMedir: ["Tiempo", "RPE"],
              },
              {
                ejercicioId: "equilibrio-monopodal-inestable",
                series: 3,
                repeticiones: "30 s",
                carga: "—",
                variablesAMedir: ["Tiempo", "RPE"],
                notas: "Ojos cerrados en las 2 últimas series.",
              },
            ],
          },
          {
            id: "marcos-s14-viernes",
            dia: "Viernes",
            nombre: "Fuerza y movilidad",
            ejercicios: [
              {
                ejercicioId: "step-down-excentrico",
                series: 3,
                repeticiones: "8",
                carga: "Peso corporal",
                variablesAMedir: ["Repeticiones", "Dolor EVA", "RPE"],
              },
              {
                ejercicioId: "movilidad-cadera-cuatro-apoyos",
                series: 2,
                repeticiones: "10 circunducciones",
                carga: "—",
                variablesAMedir: ["Repeticiones", "Dolor EVA"],
              },
              {
                ejercicioId: "isometrico-cuadriceps",
                series: 3,
                repeticiones: "30 s",
                carga: "—",
                variablesAMedir: ["Tiempo", "RPE", "Dolor EVA"],
                notas: "Mantenimiento — ya no es prioritario en esta fase.",
              },
            ],
          },
          {
            id: "marcos-s14-sabado",
            dia: "Sábado",
            nombre: "Readaptación al campo",
            ejercicios: [
              {
                ejercicioId: "marcha-banda-carga",
                series: 1,
                repeticiones: "10 min",
                carga: "Chaleco lastrado 4 kg",
                variablesAMedir: ["Tiempo", "Velocidad", "RPE"],
              },
              {
                ejercicioId: "hop-test-unilateral",
                series: 3,
                repeticiones: "1 intento / pierna",
                carga: "—",
                variablesAMedir: ["Distancia", "RPE"],
                notas: "Comparar simetría izq/der — lado operado: izquierdo.",
              },
              {
                ejercicioId: "drop-jump",
                series: 3,
                repeticiones: "3",
                carga: "Cajón 20 cm",
                variablesAMedir: ["Altura", "Tiempo", "RPE"],
                notas: "Solo si el hop test muestra simetría > 80%.",
              },
            ],
          },
        ],
      },
    ],
  },
];

export function getProgramacion(atletaId: string): Programacion | undefined {
  return programaciones.find((p) => p.atletaId === atletaId);
}
