/**
 * Librería de ejercicios de readaptación deportiva. Sin backend: datos
 * ficticios pero clínicamente plausibles. En la app real cada ejercicio
 * enlaza a un vídeo externo — aquí solo se muestra un placeholder.
 */

export const CATEGORIAS = [
  "Fuerza",
  "Pliometría",
  "Propiocepción",
  "Movilidad",
  "Cardio",
] as const;
export type Categoria = (typeof CATEGORIAS)[number];

export const FASES = ["Fase 1", "Fase 2", "Fase 3", "Fase 4"] as const;
export type Fase = (typeof FASES)[number];

export const VARIABLES_MEDIBLES = [
  "Carga",
  "Series",
  "Repeticiones",
  "Tiempo",
  "Altura",
  "Distancia",
  "Velocidad",
  "Dolor EVA",
  "RPE",
] as const;
export type VariableMedible = (typeof VARIABLES_MEDIBLES)[number];

export type Ejercicio = {
  id: string;
  nombre: string;
  categoria: Categoria;
  patron: string;
  material: string;
  fasesSugeridas: Fase[];
  variables: VariableMedible[];
  descripcion: string;
};

export const ejercicios: Ejercicio[] = [
  {
    id: "isometrico-cuadriceps",
    nombre: "Isométrico de cuádriceps",
    categoria: "Fuerza",
    patron: "Rodilla — dominante",
    material: "Peso corporal",
    fasesSugeridas: ["Fase 1"],
    variables: ["Tiempo", "RPE", "Dolor EVA"],
    descripcion: "Contracción isométrica en extensión protegida de rodilla, sin carga axial.",
  },
  {
    id: "puente-gluteo-bipodal",
    nombre: "Puente de glúteo bipodal",
    categoria: "Fuerza",
    patron: "Cadera — bisagra",
    material: "Peso corporal",
    fasesSugeridas: ["Fase 1"],
    variables: ["Series", "Repeticiones", "RPE", "Dolor EVA"],
    descripcion: "Activación de cadena posterior con apoyo bipodal en rango controlado.",
  },
  {
    id: "movilidad-tobillo-rodilla-pared",
    nombre: "Movilidad de tobillo (rodilla-pared)",
    categoria: "Movilidad",
    patron: "Tobillo — dorsiflexión",
    material: "Peso corporal",
    fasesSugeridas: ["Fase 1"],
    variables: ["Distancia", "Dolor EVA"],
    descripcion: "Ganancia de rango de dorsiflexión en carga, midiendo distancia rodilla-pared.",
  },
  {
    id: "equilibrio-monopodal-inestable",
    nombre: "Equilibrio monopodal en superficie inestable",
    categoria: "Propiocepción",
    patron: "Equilibrio — estático",
    material: "Superficie inestable (bosu/foam)",
    fasesSugeridas: ["Fase 1", "Fase 2"],
    variables: ["Tiempo", "RPE"],
    descripcion: "Control postural monopodal sobre superficie inestable, ojos abiertos/cerrados.",
  },
  {
    id: "marcha-banda-carga",
    nombre: "Marcha en banda con carga progresiva",
    categoria: "Cardio",
    patron: "Locomoción",
    material: "Cinta rodante + chaleco lastrado",
    fasesSugeridas: ["Fase 1", "Fase 2"],
    variables: ["Tiempo", "Velocidad", "Carga", "RPE"],
    descripcion: "Reacondicionamiento cardiovascular de bajo impacto con carga externa progresiva.",
  },
  {
    id: "perturbaciones-tabla-equilibrio",
    nombre: "Perturbaciones en tabla de equilibrio",
    categoria: "Propiocepción",
    patron: "Equilibrio — dinámico",
    material: "Tabla de equilibrio",
    fasesSugeridas: ["Fase 2", "Fase 3"],
    variables: ["Tiempo", "RPE"],
    descripcion: "Respuesta a perturbaciones externas manuales sobre tabla inestable.",
  },
  {
    id: "step-down-excentrico",
    nombre: "Step-down excéntrico",
    categoria: "Fuerza",
    patron: "Rodilla — unilateral",
    material: "Cajón de step",
    fasesSugeridas: ["Fase 2"],
    variables: ["Series", "Repeticiones", "Dolor EVA", "RPE"],
    descripcion: "Control excéntrico de rodilla en descenso unilateral desde step bajo.",
  },
  {
    id: "elevacion-talones-unilateral",
    nombre: "Elevación de talones unilateral",
    categoria: "Fuerza",
    patron: "Tobillo — flexión plantar",
    material: "Peso corporal / mancuerna",
    fasesSugeridas: ["Fase 2", "Fase 3"],
    variables: ["Series", "Repeticiones", "Carga", "RPE"],
    descripcion: "Fuerza de tríceps sural a una pierna, clave en tendinopatías aquíleas.",
  },
  {
    id: "movilidad-cadera-cuatro-apoyos",
    nombre: "Movilidad de cadera en 4 apoyos",
    categoria: "Movilidad",
    patron: "Cadera — rotación",
    material: "Peso corporal",
    fasesSugeridas: ["Fase 2"],
    variables: ["Repeticiones", "Dolor EVA"],
    descripcion: "Circunducciones controladas de cadera en cuadrupedia para ganar rango.",
  },
  {
    id: "sentadilla-bulgara",
    nombre: "Sentadilla búlgara",
    categoria: "Fuerza",
    patron: "Rodilla — unilateral",
    material: "Banco + mancuernas",
    fasesSugeridas: ["Fase 3"],
    variables: ["Series", "Repeticiones", "Carga", "RPE"],
    descripcion: "Fuerza unilateral de tren inferior con pie trasero elevado.",
  },
  {
    id: "peso-muerto-rumano-una-pierna",
    nombre: "Peso muerto rumano a una pierna",
    categoria: "Fuerza",
    patron: "Cadera — bisagra unilateral",
    material: "Mancuerna / kettlebell",
    fasesSugeridas: ["Fase 3"],
    variables: ["Series", "Repeticiones", "Carga", "RPE"],
    descripcion: "Fuerza de cadena posterior y control de equilibrio en bisagra unipodal.",
  },
  {
    id: "nordic-curl",
    nombre: "Nordic curl",
    categoria: "Fuerza",
    patron: "Rodilla — isquiotibiales excéntrico",
    material: "Peso corporal + anclaje de tobillos",
    fasesSugeridas: ["Fase 3", "Fase 4"],
    variables: ["Series", "Repeticiones", "RPE", "Dolor EVA"],
    descripcion: "Fuerza excéntrica de isquiotibiales, referencia en prevención de recidivas.",
  },
  {
    id: "cmj",
    nombre: "CMJ (Counter Movement Jump)",
    categoria: "Pliometría",
    patron: "Salto — vertical bipodal",
    material: "Plataforma de contacto",
    fasesSugeridas: ["Fase 3", "Fase 4"],
    variables: ["Altura", "RPE"],
    descripcion: "Salto vertical con contramovimiento; también usado como test de potencia.",
  },
  {
    id: "drop-jump",
    nombre: "Drop Jump",
    categoria: "Pliometría",
    patron: "Salto — vertical con caída",
    material: "Plataforma de contacto + cajón",
    fasesSugeridas: ["Fase 4"],
    variables: ["Altura", "Tiempo", "RPE"],
    descripcion: "Caída desde cajón con salto reactivo inmediato; mide capacidad reactiva (RSI).",
  },
  {
    id: "hop-test-unilateral",
    nombre: "Hop test unilateral",
    categoria: "Pliometría",
    patron: "Salto — horizontal unipodal",
    material: "Cinta métrica",
    fasesSugeridas: ["Fase 4"],
    variables: ["Distancia", "RPE"],
    descripcion: "Salto horizontal a una pierna; criterio clásico de simetría en el alta deportiva.",
  },
];

export function getEjercicio(id: string): Ejercicio | undefined {
  return ejercicios.find((e) => e.id === id);
}
