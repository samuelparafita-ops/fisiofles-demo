/**
 * Semilla inicial del store (`lib/store/`). Datos ficticios pero
 * clínicamente plausibles: 10 atletas con lesiones/deportes/fases variadas,
 * usando el catálogo REAL de `docs/mediciones-catalogo.csv`
 * (`lib/store/catalogo.ts`). `buildSeed()` es la única función exportada que
 * importa — se llama tanto al montar el store como en "Restablecer demo".
 *
 * Nada de esto se importa directamente desde componentes: son solo la
 * semilla, el store es la fuente de verdad (ver CLAUDE.md).
 */

import { catalogoSemilla, testPorNombre, variablePorNombre } from "@/lib/store/catalogo";
import { ACENTO_DEFECTO } from "@/lib/personalizacion/acentos";
import { UMBRALES_DEFECTO } from "@/lib/personalizacion/umbrales";
import { GRAFICOS_DASHBOARD_DEFECTO, FICHA_GRAFICOS_DEFECTO } from "@/lib/dashboard/graficos";
import type {
  AppState,
  Atleta,
  BloqueSemanal,
  Capacidad,
  Config,
  EjercicioProgramado,
  Entrenador,
  EstadoSesion,
  FormularioDef,
  FormularioEnvio,
  Hito,
  NotaClinica,
  Notificacion,
  PlantillaPrograma,
  PlantillaSesion,
  PreguntaAnamnesis,
  RegistroTest,
  Sesion,
  Suscripcion,
  TestDef,
  TipoHito,
  ValorCuestionario,
  ValorUnico,
  ValorUnilateral,
} from "@/lib/store/types";
import { ejercicios } from "./ejercicios";

// ---------------------------------------------------------------------------
// Helpers de fecha e id
// ---------------------------------------------------------------------------

let contadorId = 0;
function id(prefijo: string): string {
  contadorId += 1;
  return `${prefijo}-${contadorId}`;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function toIso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function addDias(base: Date, dias: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + dias);
  return d;
}

const NOMBRES_DIA: readonly [string, string, string, string, string, string, string] = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

function diaSemanaDeIso(fechaIso: string) {
  const d = new Date(`${fechaIso}T00:00:00`);
  return NOMBRES_DIA[d.getDay()] as Sesion["dia"];
}

// ---------------------------------------------------------------------------
// Helpers de registros de test (usan el catálogo real)
// ---------------------------------------------------------------------------

function regUnilateral(
  atletaId: string,
  testNombre: string,
  fecha: string,
  variables: Record<string, { izq: number; der: number }>
): RegistroTest {
  const test = testPorNombre(catalogoSemilla, testNombre);
  const valores: ValorUnilateral = {};
  for (const [nombreVar, v] of Object.entries(variables)) {
    valores[variablePorNombre(test, nombreVar).id] = v;
  }
  return { id: id("reg"), atletaId, testId: test.id, fecha, valores };
}

function regValorUnico(
  atletaId: string,
  testNombre: string,
  fecha: string,
  variables: Record<string, number>
): RegistroTest {
  const test = testPorNombre(catalogoSemilla, testNombre);
  const valores: ValorUnico = {};
  for (const [nombreVar, v] of Object.entries(variables)) {
    valores[variablePorNombre(test, nombreVar).id] = v;
  }
  return { id: id("reg"), atletaId, testId: test.id, fecha, valores };
}

function regCuestionario(
  atletaId: string,
  testNombre: string,
  fecha: string,
  puntuacion: number
): RegistroTest {
  const test = testPorNombre(catalogoSemilla, testNombre);
  const valores: ValorCuestionario = { puntuacion };
  return { id: id("reg"), atletaId, testId: test.id, fecha, valores };
}

// ---------------------------------------------------------------------------
// Helpers de hitos / notas / sesiones / bloques
// ---------------------------------------------------------------------------

function hito(fecha: string, titulo: string, tipo: TipoHito, descripcion?: string): Hito {
  return { id: id("hito"), fecha, titulo, tipo, descripcion };
}

function nota(fecha: string, texto: string): NotaClinica {
  return { id: id("nota"), fecha, texto };
}

function crearSesion(
  atletaId: string,
  fecha: string,
  nombre: string,
  ejerciciosSesion: EjercicioProgramado[],
  estado: EstadoSesion,
  notas?: string
): Sesion {
  return {
    id: id("ses"),
    atletaId,
    fecha,
    dia: diaSemanaDeIso(fecha),
    nombre,
    ejercicios: ejerciciosSesion,
    estado,
    notas,
  };
}

function crearBloque(
  atletaId: string,
  nombre: string,
  fechaInicio: string,
  fechaFin: string,
  objetivo: string,
  sesionesBloque: Sesion[]
): BloqueSemanal {
  return {
    id: id("bloque"),
    atletaId,
    nombre,
    fechaInicio,
    fechaFin,
    objetivo,
    sesionIds: sesionesBloque.map((s) => s.id),
  };
}

const EJES_PERFIL_FISICO: Capacidad[] = [
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
];

function perfilCompleto(
  valores: [number, number, number][]
): Atleta["perfilFisico"] {
  return EJES_PERFIL_FISICO.map((eje, i) => ({
    eje,
    inicial: valores[i][0],
    actual: valores[i][1],
    objetivo: valores[i][2],
  }));
}

function perfilParcial(
  ejes: Capacidad[],
  valores: [number, number, number][]
): Atleta["perfilFisico"] {
  return ejes.map((eje, i) => ({
    eje,
    inicial: valores[i][0],
    actual: valores[i][1],
    objetivo: valores[i][2],
  }));
}

function acwrSemanas(inicioSemana: number, agudos: number[]): Atleta["acwr"] {
  return agudos.map((agudo, i) => ({ semana: `S${inicioSemana + i}`, agudo }));
}

/** `dolor`, `rpe` y `readiness` en 0–10; `carga` en sRPE bruto. */
function evolucionPuntos(
  fechas: string[],
  dolor: number[],
  carga: number[],
  rpe: number[],
  readiness: number[]
): Atleta["evolucion"] {
  return fechas.map((fecha, i) => ({
    fecha,
    dolor: dolor[i],
    carga: carga[i],
    rpe: rpe[i],
    readiness: readiness[i],
  }));
}

function anamnesis(pares: [string, string][]): PreguntaAnamnesis[] {
  return pares.map(([pregunta, respuesta]) => ({ pregunta, respuesta }));
}

// ---------------------------------------------------------------------------
// Entrenadores y suscripciones
// ---------------------------------------------------------------------------

const entrenadores: Entrenador[] = [
  { id: "alex-rios", nombre: "Álex Ríos", iniciales: "AR", rol: "Readaptador", capacidadMaxima: 6 },
  { id: "marta-pena", nombre: "Marta Peña", iniciales: "MP", rol: "Fisioterapeuta", capacidadMaxima: 5 },
  { id: "jorge-lema", nombre: "Jorge Lema", iniciales: "JL", rol: "Preparador físico", capacidadMaxima: 4 },
];

const DURACION_PLAN: Record<string, number> = {
  Mensual: 30,
  Trimestral: 90,
  "Readaptación completa": 180,
};

// Ejercicios de librería reutilizados en la programación de todos los atletas.
const EJ = {
  isoQuad: (): EjercicioProgramado => ({
    ejercicioId: "isometrico-cuadriceps",
    series: 3,
    repeticiones: "30 s",
    carga: "—",
    variablesAMedir: ["Tiempo", "RPE", "Dolor EVA"],
  }),
  puenteGluteo: (): EjercicioProgramado => ({
    ejercicioId: "puente-gluteo-bipodal",
    series: 3,
    repeticiones: "12",
    carga: "Peso corporal",
    variablesAMedir: ["Series", "Repeticiones", "RPE"],
  }),
  movilidadTobillo: (): EjercicioProgramado => ({
    ejercicioId: "movilidad-tobillo-rodilla-pared",
    series: 3,
    repeticiones: "10",
    carga: "—",
    variablesAMedir: ["Distancia", "Dolor EVA"],
  }),
  equilibrioMonopodal: (): EjercicioProgramado => ({
    ejercicioId: "equilibrio-monopodal-inestable",
    series: 3,
    repeticiones: "30 s",
    carga: "—",
    variablesAMedir: ["Tiempo", "RPE"],
  }),
  marchaBanda: (): EjercicioProgramado => ({
    ejercicioId: "marcha-banda-carga",
    series: 1,
    repeticiones: "12 min",
    carga: "Chaleco lastrado 4 kg",
    variablesAMedir: ["Tiempo", "Velocidad", "RPE"],
  }),
  perturbaciones: (): EjercicioProgramado => ({
    ejercicioId: "perturbaciones-tabla-equilibrio",
    series: 3,
    repeticiones: "30 s",
    carga: "—",
    variablesAMedir: ["Tiempo", "RPE"],
  }),
  stepDown: (): EjercicioProgramado => ({
    ejercicioId: "step-down-excentrico",
    series: 3,
    repeticiones: "8",
    carga: "Peso corporal",
    variablesAMedir: ["Repeticiones", "Dolor EVA", "RPE"],
  }),
  talonesUnilateral: (): EjercicioProgramado => ({
    ejercicioId: "elevacion-talones-unilateral",
    series: 4,
    repeticiones: "15",
    carga: "Peso corporal + 5 kg",
    variablesAMedir: ["Repeticiones", "Carga", "RPE"],
  }),
  movilidadCadera: (): EjercicioProgramado => ({
    ejercicioId: "movilidad-cadera-cuatro-apoyos",
    series: 2,
    repeticiones: "10 circunducciones",
    carga: "—",
    variablesAMedir: ["Repeticiones", "Dolor EVA"],
  }),
  bulgara: (): EjercicioProgramado => ({
    ejercicioId: "sentadilla-bulgara",
    series: 4,
    repeticiones: "8",
    carga: "16 kg / mano",
    variablesAMedir: ["Carga", "RPE", "Dolor EVA"],
  }),
  pesoMuertoUnaPierna: (): EjercicioProgramado => ({
    ejercicioId: "peso-muerto-rumano-una-pierna",
    series: 3,
    repeticiones: "10",
    carga: "12 kg",
    variablesAMedir: ["Carga", "RPE"],
  }),
  nordic: (): EjercicioProgramado => ({
    ejercicioId: "nordic-curl",
    series: 3,
    repeticiones: "6",
    carga: "Peso corporal (asistido con banda)",
    variablesAMedir: ["Repeticiones", "RPE", "Dolor EVA"],
  }),
  cmj: (): EjercicioProgramado => ({
    ejercicioId: "cmj",
    series: 4,
    repeticiones: "3 saltos",
    carga: "Peso corporal",
    variablesAMedir: ["Altura", "RPE"],
  }),
  dropJump: (): EjercicioProgramado => ({
    ejercicioId: "drop-jump",
    series: 3,
    repeticiones: "3",
    carga: "Cajón 20 cm",
    variablesAMedir: ["Altura", "Tiempo", "RPE"],
  }),
  hopUnilateral: (): EjercicioProgramado => ({
    ejercicioId: "hop-test-unilateral",
    series: 3,
    repeticiones: "1 intento / pierna",
    carga: "—",
    variablesAMedir: ["Distancia", "RPE"],
  }),
};

// ---------------------------------------------------------------------------
// Ampliación determinista de registros de test
//
// El dashboard v3 pinta un gráfico por test del catálogo, así que la semilla
// necesita histórico en TODOS los tests, no solo en los que se escribieron a
// mano arriba. Estas tablas describen, por test y por atleta, cómo se ve una
// medición "de hoy"; el generador (`generarRegistros`) interpola hacia atrás
// en el tiempo. Todo determinista: mismos valores en cada `buildSeed()`.
// ---------------------------------------------------------------------------

/** Valor de referencia de una variable en la medición MÁS RECIENTE del atleta medio. */
type EspecVariable = { valor: number; dec: number; menorEsMejor?: boolean };

/** `mejora` = ganancia relativa acumulada entre el registro más antiguo y el más reciente. */
type EspecTest = { mejora: number; vars: Record<string, EspecVariable> };

/** Indexado por id de test / id de variable del catálogo (slugs de `lib/store/catalogo.ts`). */
const ESPEC_TESTS: Record<string, EspecTest> = {
  cmj: {
    mejora: 0.16,
    vars: {
      altura: { valor: 32, dec: 1 },
      "peak-power": { valor: 45, dec: 1 },
      "rsi-mod": { valor: 0.46, dec: 2 },
      "tiempo-de-contacto": { valor: 0.24, dec: 2, menorEsMejor: true },
      "tiempo-de-vuelo": { valor: 0.51, dec: 2 },
      impulso: { valor: 218, dec: 0 },
    },
  },
  sj: { mejora: 0.15, vars: { altura: { valor: 28.5, dec: 1 }, "peak-power": { valor: 41, dec: 1 } } },
  abalakov: { mejora: 0.15, vars: { altura: { valor: 35, dec: 1 } } },
  "drop-jump": {
    mejora: 0.17,
    vars: {
      altura: { valor: 29.5, dec: 1 },
      rsi: { valor: 1.38, dec: 2 },
      "tiempo-de-contacto": { valor: 0.22, dec: 2, menorEsMejor: true },
    },
  },
  "sl-cmj": { mejora: 0.18, vars: { altura: { valor: 19.5, dec: 1 } } },
  "sl-drop-jump": { mejora: 0.18, vars: { altura: { valor: 16.5, dec: 1 } } },
  imtp: {
    mejora: 0.18,
    vars: {
      "peak-force": { valor: 2350, dec: 0 },
      "fuerza-relativa": { valor: 32.5, dec: 1 },
      rfd: { valor: 5800, dec: 0 },
    },
  },
  "dinamometria-cuadriceps": { mejora: 0.2, vars: { fuerza: { valor: 355, dec: 0 } } },
  "dinamometria-isquios": { mejora: 0.2, vars: { fuerza: { valor: 228, dec: 0 } } },
  "dinamometria-aductores": { mejora: 0.2, vars: { fuerza: { valor: 212, dec: 0 } } },
  nordic: { mejora: 0.22, vars: { fuerza: { valor: 305, dec: 0 } } },
  "1rm-estimado": {
    mejora: 0.16,
    vars: { carga: { valor: 102, dec: 0 }, "fuerza-relativa": { valor: 1.32, dec: 2 } },
  },
  "5rm": { mejora: 0.16, vars: { carga: { valor: 86, dec: 0 } } },
  "rom-rodilla-flexion": { mejora: 0.12, vars: { grados: { valor: 134, dec: 0 } } },
  // Déficit de extensión: se mide lo que FALTA para el 0°, así que menos es mejor.
  "rom-rodilla-extension": { mejora: 1.5, vars: { grados: { valor: 1, dec: 0, menorEsMejor: true } } },
  "rom-tobillo-dorsiflexion": {
    mejora: 0.22,
    vars: { grados: { valor: 38, dec: 0 }, distancia: { valor: 11.2, dec: 1 } },
  },
  "rom-cadera": { mejora: 0.2, vars: { grados: { valor: 43, dec: 0 } } },
  "sprint-10m": { mejora: 0.07, vars: { tiempo: { valor: 1.8, dec: 2, menorEsMejor: true } } },
  "sprint-30m": { mejora: 0.06, vars: { tiempo: { valor: 4.32, dec: 2, menorEsMejor: true } } },
  "velocidad-maxima": { mejora: 0.08, vars: { vmax: { valor: 7.7, dec: 2 } } },
  aceleracion: { mejora: 0.07, vars: { tiempo: { valor: 1.04, dec: 2, menorEsMejor: true } } },
  "505": {
    mejora: 0.1,
    vars: {
      tiempo: { valor: 2.42, dec: 2, menorEsMejor: true },
      "deficit-cod": { valor: 0.24, dec: 2, menorEsMejor: true },
    },
  },
  illinois: { mejora: 0.08, vars: { tiempo: { valor: 16.4, dec: 2, menorEsMejor: true } } },
  "single-hop": { mejora: 0.18, vars: { distancia: { valor: 190, dec: 0 } } },
  "triple-hop": { mejora: 0.18, vars: { distancia: { valor: 555, dec: 0 } } },
  "crossover-hop": { mejora: 0.18, vars: { distancia: { valor: 530, dec: 0 } } },
};

/** Cuestionarios PRO: recorrido de la puntuación entre el peor y el mejor estado. */
const ESPEC_PRO: Record<string, { inicial: number; final: number }> = {
  "acl-rsi": { inicial: 32, final: 88 },
  ikdc: { inicial: 42, final: 92 },
  koos: { inicial: 46, final: 93 },
  "visa-a": { inicial: 38, final: 86 },
  lefs: { inicial: 42, final: 78 },
  nprs: { inicial: 7, final: 1 }, // escala 0-10 invertida: menos dolor es mejor
};

type PerfilSemilla = {
  /** Escala física global del atleta (1 = atleta medio del modelo). */
  factor: number;
  ladoDebil: "izq" | "der";
  /** Simetría (0-1) en el registro más antiguo y en el más reciente de la ventana. */
  lsiInicio: number;
  lsiFin: number;
  /** Posición (0-1) dentro del recorrido de los cuestionarios PRO. */
  proInicio: number;
  proFin: number;
  /** Offset (días respecto a hoy) del registro más antiguo generado. */
  diaInicio: number;
};

/**
 * Nerea Otxoa queda FUERA del generador a propósito: es el caso "recién
 * llegada / datos escasos" de la demo (radar incompleto, ACWR no calculable).
 */
const PERFILES_SEMILLA: Record<string, PerfilSemilla> = {
  "marcos-vidal": { factor: 1.08, ladoDebil: "izq", lsiInicio: 0.58, lsiFin: 0.76, proInicio: 0.05, proFin: 0.62, diaInicio: -98 },
  "laura-saez": { factor: 0.84, ladoDebil: "izq", lsiInicio: 0.66, lsiFin: 0.88, proInicio: 0.15, proFin: 0.72, diaInicio: -56 },
  "diego-torres": { factor: 1.12, ladoDebil: "der", lsiInicio: 0.8, lsiFin: 0.96, proInicio: 0.3, proFin: 0.9, diaInicio: -112 },
  // Lumbalgia: sin déficit lateral relevante, simetría alta y estable.
  "ruben-campos": { factor: 1.05, ladoDebil: "der", lsiInicio: 0.92, lsiFin: 0.96, proInicio: 0.1, proFin: 0.45, diaInicio: -35 },
  "marta-iglesias": { factor: 0.9, ladoDebil: "izq", lsiInicio: 0.62, lsiFin: 0.78, proInicio: 0.2, proFin: 0.7, diaInicio: -63 },
  "pol-serra": { factor: 0.98, ladoDebil: "der", lsiInicio: 0.84, lsiFin: 0.93, proInicio: 0.18, proFin: 0.66, diaInicio: -70 },
  "carla-domenech": { factor: 0.88, ladoDebil: "der", lsiInicio: 0.82, lsiFin: 0.95, proInicio: 0.22, proFin: 0.75, diaInicio: -91 },
  "ivan-roldan": { factor: 1.1, ladoDebil: "izq", lsiInicio: 0.86, lsiFin: 0.96, proInicio: 0.28, proFin: 0.88, diaInicio: -112 },
  "sofia-marin": { factor: 0.95, ladoDebil: "izq", lsiInicio: 0.88, lsiFin: 0.98, proInicio: 0.35, proFin: 0.97, diaInicio: -112 },
};

/** Nº de registros objetivo por par atleta/test (dentro del rango 3-6 pedido). */
const REGISTROS_OBJETIVO = 4;

/** Hash estable (no aleatorio) para variar nº de registros y fechas por par. */
function huella(texto: string): number {
  let h = 7;
  for (let i = 0; i < texto.length; i += 1) h = (h * 31 + texto.charCodeAt(i)) % 100003;
  return h;
}

function redondear(valor: number, dec: number): number {
  const f = 10 ** dec;
  return Math.round(valor * f) / f;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Ganancia relativa del test entre su registro más antiguo y el más reciente. */
function mejoraDeTest(test: TestDef): number | null {
  if (test.tipo === "cuestionario-pro") return ESPEC_PRO[test.id] ? 0.28 : null;
  return ESPEC_TESTS[test.id]?.mejora ?? null;
}

/**
 * Valores de un registro nuevo en la posición temporal `p` (0 = el más antiguo
 * de la serie del atleta, 1 = el más reciente).
 */
function valoresGenerados(
  test: TestDef,
  perfil: PerfilSemilla,
  p: number
): RegistroTest["valores"] | null {
  if (test.tipo === "cuestionario-pro") {
    const espec = ESPEC_PRO[test.id];
    if (!espec) return null;
    const pro = lerp(perfil.proInicio, perfil.proFin, p);
    const valores: ValorCuestionario = { puntuacion: Math.round(lerp(espec.inicial, espec.final, pro)) };
    return valores;
  }

  const espec = ESPEC_TESTS[test.id];
  if (!espec) return null;

  if (test.tipo === "unilateral-lsi") {
    // El LSI NUNCA se guarda: se calcula con `lib/calculations/simetria.ts`.
    const valores: ValorUnilateral = {};
    for (const [variableId, v] of Object.entries(espec.vars)) {
      const fuerte = redondear(v.valor * perfil.factor * (1 + espec.mejora * (p - 1)), v.dec);
      const debil = redondear(fuerte * lerp(perfil.lsiInicio, perfil.lsiFin, p), v.dec);
      valores[variableId] =
        perfil.ladoDebil === "izq" ? { izq: debil, der: fuerte } : { izq: fuerte, der: debil };
    }
    return valores;
  }

  const valores: ValorUnico = {};
  for (const [variableId, v] of Object.entries(espec.vars)) {
    // En tiempos y déficits, el atleta con mejor nivel marca valores MÁS BAJOS.
    const escala = v.menorEsMejor ? 2 - perfil.factor : perfil.factor;
    const direccion = v.menorEsMejor ? -1 : 1;
    valores[variableId] = redondear(
      v.valor * escala * (1 + direccion * espec.mejora * (p - 1)),
      v.dec
    );
  }
  return valores;
}

/**
 * Extrapola hacia atrás (k pasos) el registro más antiguo que ya existía de un
 * par atleta/test, para darle histórico sin tocar su medición más reciente.
 */
function valoresRetro(
  test: TestDef,
  ref: RegistroTest,
  decremento: number,
  k: number
): RegistroTest["valores"] {
  const atenuacion = 1 - decremento * k;
  const espec = ESPEC_TESTS[test.id];

  if (test.tipo === "cuestionario-pro") {
    const { puntuacion } = ref.valores as ValorCuestionario;
    const pro = ESPEC_PRO[test.id];
    const menorEsMejor = pro ? pro.final < pro.inicial : false;
    const factor = menorEsMejor ? 1 + decremento * k : atenuacion;
    const valores: ValorCuestionario = { puntuacion: Math.round(puntuacion * factor) };
    return valores;
  }

  if (test.tipo === "unilateral-lsi") {
    const valores: ValorUnilateral = {};
    for (const [variableId, valor] of Object.entries(ref.valores as ValorUnilateral)) {
      const dec = espec?.vars[variableId]?.dec ?? 1;
      const fuerte = Math.max(valor.izq, valor.der);
      const debil = Math.min(valor.izq, valor.der);
      const lsiRetro = fuerte > 0 ? Math.max(0.45, debil / fuerte - 0.05 * k) : 0;
      const fuerteRetro = redondear(fuerte * atenuacion, dec);
      const debilRetro = redondear(fuerteRetro * lsiRetro, dec);
      // El lado débil se conserva: nunca contradecimos el registro escrito a mano.
      valores[variableId] =
        valor.izq <= valor.der
          ? { izq: debilRetro, der: fuerteRetro }
          : { izq: fuerteRetro, der: debilRetro };
    }
    return valores;
  }

  const valores: ValorUnico = {};
  for (const [variableId, valor] of Object.entries(ref.valores as ValorUnico)) {
    const v = espec?.vars[variableId];
    valores[variableId] = redondear(
      valor * (v?.menorEsMejor ? 1 + decremento * k : atenuacion),
      v?.dec ?? 2
    );
  }
  return valores;
}

// ---------------------------------------------------------------------------
// buildSeed
// ---------------------------------------------------------------------------

export function buildSeed(): AppState {
  contadorId = 0;
  const hoy = new Date();
  const iso = (offsetDias: number) => toIso(addDias(hoy, offsetDias));

  /** Suscripción que vence dentro de `diasHastaFin`; el inicio sale de la duración del plan. */
  const suscripcion = (plan: keyof typeof DURACION_PLAN, diasHastaFin: number): Suscripcion => ({
    plan,
    fechaInicio: iso(diasHastaFin - DURACION_PLAN[plan]),
    fechaFin: iso(diasHastaFin),
  });

  const atletas: Atleta[] = [];
  const registrosTests: RegistroTest[] = [];
  const sesiones: Sesion[] = [];
  const bloques: BloqueSemanal[] = [];

  // ===== 1. Marcos Vidal — Fútbol — LCA rodilla izq — Fase 3 =====
  {
    const atletaId = "marcos-vidal";
    atletas.push({
      id: atletaId,
      nombre: "Marcos Vidal",
      deporte: "Fútbol",
      lesion: "Reconstrucción LCA rodilla izq.",
      lesionDetalle:
        "Reconstrucción de LCA con injerto HTH, rotura completa en entrada a destiempo. Sin lesiones meniscales asociadas.",
      fase: "Fase 3 · Readaptación al campo",
      semanaProceso: 14,
      avatarInitials: "MV",
      sexo: "Hombre",
      email: "marcos.vidal@example.com",
      telefono: "+34 611 222 333",
      fechaNacimiento: "1999-03-12",
      fechaInicioTratamiento: iso(-98),
      estado: "activo",
      entrenadorId: "alex-rios",
      suscripcion: suscripcion("Trimestral", 9),
      anamnesis: anamnesis([
        ["Mecanismo de lesión", "Entrada a destiempo en partido, valgo forzado de rodilla izquierda con el pie fijo."],
        ["Antecedentes en la misma zona", "Ninguno previo en la rodilla izquierda; esguince de tobillo derecho en 2021."],
        ["Dolor inicial (EVA 0-10)", "8/10 las primeras 72 h; 3/10 al alta hospitalaria."],
        ["Medicación actual", "Ninguna. Retiró el antiinflamatorio a las 3 semanas de la cirugía."],
        ["Objetivo deportivo", "Volver a jugar como titular en su equipo de fútbol federado."],
        ["Expectativa de vuelta", "Espera competir antes de 6 meses desde la cirugía."],
        ["Carga de entrenamiento previa", "5 sesiones + 1 partido por semana."],
        ["Experiencia previa en readaptación", "No. Es su primer proceso largo de recuperación."],
      ]),
      notas: [
        nota(iso(-70), "Buena adherencia al plan. Sin derrame tras las últimas sesiones de fuerza."),
        nota(iso(-21), "Aparece aprensión leve en cambios de dirección a máxima velocidad; se pospone la reintroducción de COD agresivo una semana."),
        nota(iso(-3), "ACWR de esta semana disparado por partido amistoso no planificado con el equipo — vigilar la próxima semana."),
      ],
      hitos: [
        hito(iso(-98), "Rotura de LCA en partido", "lesion", "Entrada a destiempo, valgo forzado de rodilla izquierda."),
        hito(iso(-91), "Cirugía de reconstrucción (injerto HTH)", "cirugia"),
        hito(iso(-84), "Inicio de readaptación — Fase 1", "cambio-fase"),
        hito(iso(-56), "Cambio a Fase 2 — fuerza y control neuromuscular", "cambio-fase"),
        hito(iso(-35), "Test de fuerza: dinamometría cuádriceps", "test"),
        hito(iso(-21), "Cambio a Fase 3 — readaptación al campo", "cambio-fase"),
        hito(iso(-14), "Batería de hops y SL CMJ", "test"),
        hito(iso(-3), "Pico de carga por partido amistoso no planificado", "otro"),
      ],
      perfilFisico: perfilCompleto([
        [28.1, 36.85, 1.0],
        [24.87, 33.83, 0.5],
        [172.75, 201.5, 1.2],
        [0.25, 0.85, 0.8],
        [0.482, 0.738, 0.6],
        [1.41, 1.998, 1.5],
        [6.7, 7.4, 1.8],
        [2.936, 3.008, 1.6],
        [2.131, 2.387, 1.0],
        [0.213, 0.427, 0.9],
        [1.53, 1.734, 0.7],
        [20.83, 23.844, 1.9],
      ]),
      acwr: acwrSemanas(7, [520, 560, 600, 580, 610, 640, 670, 980]),
      evolucion: evolucionPuntos(
        [iso(-49), iso(-42), iso(-35), iso(-28), iso(-21), iso(-14), iso(-7), iso(0)],
        [6, 5, 5, 4, 4, 3, 3, 2],
        [420, 460, 480, 520, 560, 610, 670, 780],
        [5, 6, 6, 6, 7, 7, 7, 8],
        // Cae al final: el partido amistoso no planificado le pasa factura.
        [5, 5, 6, 6, 7, 7, 8, 6]
      ),
    });

    registrosTests.push(
      regUnilateral(atletaId, "Dinamometría cuádriceps", iso(-35), { Fuerza: { izq: 245, der: 375 } }),
      regUnilateral(atletaId, "Dinamometría cuádriceps", iso(-14), { Fuerza: { izq: 288, der: 382 } }),
      regUnilateral(atletaId, "SL CMJ", iso(-14), { Altura: { izq: 13.8, der: 19.1 } }),
      regUnilateral(atletaId, "Single hop", iso(-14), { Distancia: { izq: 141, der: 194 } }),
      regUnilateral(atletaId, "Triple hop", iso(-14), { Distancia: { izq: 412, der: 561 } }),
      regUnilateral(atletaId, "Crossover hop", iso(-14), { Distancia: { izq: 389, der: 538 } }),
      regCuestionario(atletaId, "ACL-RSI", iso(-56), 34),
      regCuestionario(atletaId, "ACL-RSI", iso(-14), 68),
      regCuestionario(atletaId, "IKDC", iso(-56), 42),
      regCuestionario(atletaId, "IKDC", iso(-14), 79)
    );
  }

  // ===== 2. Laura Sáez — Atletismo — Tendinopatía aquílea — Fase 2 =====
  {
    const atletaId = "laura-saez";
    atletas.push({
      id: atletaId,
      nombre: "Laura Sáez",
      deporte: "Atletismo (fondo)",
      lesion: "Tendinopatía aquílea",
      lesionDetalle: "Tendinopatía aquílea reactiva-degenerativa mixta, tendón derecho, de inicio insidioso por sobreuso.",
      fase: "Fase 2 · Reintroducción a carrera",
      semanaProceso: 8,
      avatarInitials: "LS",
      sexo: "Mujer",
      email: "laura.saez@example.com",
      telefono: "+34 622 333 444",
      fechaNacimiento: "1996-07-04",
      fechaInicioTratamiento: iso(-56),
      estado: "activo",
      entrenadorId: "marta-pena",
      suscripcion: suscripcion("Trimestral", 38),
      anamnesis: anamnesis([
        ["Mecanismo de lesión", "Inicio insidioso por sobreuso tras subir de 60 a 85 km semanales en 4 semanas."],
        ["Antecedentes en la misma zona", "Molestias aquíleas leves y autolimitadas hace dos temporadas."],
        ["Dolor inicial (EVA 0-10)", "6/10 al arrancar por la mañana; 4/10 al correr."],
        ["Medicación actual", "Ninguna pautada."],
        ["Objetivo deportivo", "Correr una media maratón de nivel autonómico en otoño."],
        ["Expectativa de vuelta", "Volver a rodajes largos en 2 meses."],
        ["Calzado y superficie habitual", "Zapatilla de drop 8 mm, mezcla de asfalto y pista."],
      ]),
      notas: [
        nota(iso(-42), "Dolor matinal en descenso. Se mantiene isometría de tríceps sural como calentamiento."),
        nota(iso(-7), "Primera reintroducción a carrera continua en cinta, 12 min sin dolor >3/10."),
      ],
      hitos: [
        hito(iso(-56), "Inicio de dolor insidioso en tendón de Aquiles derecho", "lesion"),
        hito(iso(-56), "Inicio de readaptación — Fase 1", "cambio-fase"),
        hito(iso(-49), "Ecografía: engrosamiento y neovascularización leve", "test"),
        hito(iso(-28), "Cambio a Fase 2 — reintroducción a carrera", "cambio-fase"),
        hito(iso(-14), "Test SL Drop Jump y ROM de tobillo", "test"),
        hito(iso(-7), "Primera carrera continua en cinta sin dolor", "otro"),
      ],
      perfilFisico: perfilCompleto([
        [22, 26, 1.0],
        [27, 29.8, 1.2],
        [147, 157, 1.1],
        [0.98, 1.16, 1.3],
        [0.638, 0.785, 0.9],
        [1.1, 1.31, 1.0],
        [5.6, 5.8, 1.5],
        [3.19, 3.316, 1.2],
        [2.453, 2.648, 1.1],
        [0.361, 0.503, 1.0],
        [2.764, 3.02, 0.9],
        [16.78, 17.82, 1.6],
      ]),
      acwr: acwrSemanas(1, [180, 195, 210, 205, 220, 225, 230, 228]),
      evolucion: evolucionPuntos(
        [iso(-49), iso(-42), iso(-35), iso(-28), iso(-21), iso(-14), iso(-7), iso(0)],
        [4, 4, 3, 3, 3, 2, 2, 2],
        [160, 175, 190, 200, 210, 220, 228, 232],
        [4, 4, 5, 5, 5, 6, 6, 6],
        [4, 5, 5, 6, 6, 7, 7, 8]
      ),
    });

    registrosTests.push(
      regUnilateral(atletaId, "SL Drop Jump", iso(-42), { Altura: { izq: 11.2, der: 16.4 } }),
      regUnilateral(atletaId, "SL Drop Jump", iso(-14), { Altura: { izq: 14.8, der: 17.1 } }),
      regValorUnico(atletaId, "ROM tobillo dorsiflexión", iso(-42), { Grados: 28, Distancia: 7.2 }),
      regValorUnico(atletaId, "ROM tobillo dorsiflexión", iso(-14), { Grados: 37, Distancia: 10.8 }),
      regCuestionario(atletaId, "VISA-A", iso(-49), 41),
      regCuestionario(atletaId, "VISA-A", iso(-21), 58),
      regCuestionario(atletaId, "VISA-A", iso(-7), 71)
    );
  }

  // ===== 3. Diego Torres — Baloncesto — Esguince tobillo grado II — Fase 4 =====
  {
    const atletaId = "diego-torres";
    atletas.push({
      id: atletaId,
      nombre: "Diego Torres",
      deporte: "Baloncesto",
      lesion: "Esguince de tobillo grado II",
      lesionDetalle: "Esguince lateral de tobillo derecho (LPAA), inversión forzada al caer tras un rebote.",
      fase: "Fase 4 · Alta próxima",
      semanaProceso: 20,
      avatarInitials: "DT",
      sexo: "Hombre",
      email: "diego.torres@example.com",
      telefono: "+34 633 444 555",
      fechaNacimiento: "1997-11-30",
      fechaInicioTratamiento: iso(-140),
      estado: "activo",
      entrenadorId: "alex-rios",
      suscripcion: suscripcion("Readaptación completa", 95),
      anamnesis: anamnesis([
        ["Mecanismo de lesión", "Inversión forzada de tobillo derecho al caer sobre el pie de un rival tras un rebote."],
        ["Antecedentes en la misma zona", "Dos esguinces leves del mismo tobillo en los últimos 4 años."],
        ["Dolor inicial (EVA 0-10)", "7/10 con carga en apoyo la primera semana."],
        ["Medicación actual", "Ninguna desde la fase aguda."],
        ["Objetivo deportivo", "Reincorporarse a la competición sin vendaje funcional."],
        ["Expectativa de vuelta", "Alta deportiva en las próximas 2 semanas."],
        ["Miedo o aprensión", "Refiere leve inseguridad solo en recepciones desequilibradas."],
      ]),
      notas: [
        nota(iso(-70), "Recuperado el rango completo de dorsiflexión. Progresa a trabajo pliométrico bilateral."),
        nota(iso(-7), "Últimos test de simetría dentro de objetivo. Se planifica alta en 1-2 semanas si mantiene."),
      ],
      hitos: [
        hito(iso(-140), "Esguince de tobillo derecho grado II en partido", "lesion"),
        hito(iso(-133), "Inicio de readaptación — Fase 1", "cambio-fase"),
        hito(iso(-105), "Cambio a Fase 2 — carga progresiva", "cambio-fase"),
        hito(iso(-70), "Cambio a Fase 3 — pliometría y COD", "cambio-fase"),
        hito(iso(-42), "Cambio a Fase 4 — readaptación al campo", "cambio-fase"),
        hito(iso(-21), "Batería de hops y SL Drop Jump", "test"),
        hito(iso(-7), "Reevaluación de simetría — objetivo alcanzado", "test"),
      ],
      perfilFisico: perfilCompleto([
        [31.6, 43.15, 1.2],
        [29.35, 45.03, 1.0],
        [180.8, 214.15, 1.0],
        [0.75, 2.7, 1.1],
        [0.642, 1.25, 1.0],
        [1.515, 2.124, 1.3],
        [6.84, 7.624, 1.7],
        [2.954, 3.038, 1.6],
        [2.131, 2.541, 1.1],
        [0.267, 0.577, 1.1],
        [1.65, 2.046, 1.0],
        [21.104, 24.803, 1.8],
      ]),
      acwr: acwrSemanas(13, [700, 710, 695, 720, 715, 730, 725, 718]),
      evolucion: evolucionPuntos(
        [iso(-49), iso(-42), iso(-35), iso(-28), iso(-21), iso(-14), iso(-7), iso(0)],
        [2, 2, 1, 1, 1, 0, 0, 0],
        [650, 670, 690, 700, 710, 715, 720, 718],
        [6, 6, 6, 7, 7, 7, 6, 6],
        [7, 7, 8, 8, 8, 9, 9, 9]
      ),
    });

    registrosTests.push(
      regUnilateral(atletaId, "SL Drop Jump", iso(-21), { Altura: { izq: 18.4, der: 17.6 } }),
      regUnilateral(atletaId, "Single hop", iso(-7), { Distancia: { izq: 205, der: 197 } }),
      regUnilateral(atletaId, "Triple hop", iso(-7), { Distancia: { izq: 588, der: 571 } }),
      regValorUnico(atletaId, "ROM tobillo dorsiflexión", iso(-21), { Grados: 32, Distancia: 9.1 }),
      regValorUnico(atletaId, "ROM tobillo dorsiflexión", iso(-7), { Grados: 41, Distancia: 12.4 }),
      regCuestionario(atletaId, "LEFS", iso(-21), 61),
      regCuestionario(atletaId, "LEFS", iso(-7), 76)
    );
  }

  // ===== 4. Nerea Otxoa — Balonmano — Inestabilidad de hombro — Fase 1 (recién llegada) =====
  {
    const atletaId = "nerea-otxoa";
    atletas.push({
      id: atletaId,
      nombre: "Nerea Otxoa",
      deporte: "Balonmano",
      lesion: "Inestabilidad de hombro (luxación anterior)",
      lesionDetalle: "Luxación anterior de hombro derecho durante lanzamiento, primer episodio, tratamiento conservador.",
      fase: "Fase 1 · Evaluación y protección",
      semanaProceso: 2,
      avatarInitials: "NO",
      sexo: "Mujer",
      email: "nerea.otxoa@example.com",
      telefono: "+34 644 555 666",
      fechaNacimiento: "2001-05-19",
      fechaInicioTratamiento: iso(-14),
      estado: "activo",
      entrenadorId: "marta-pena",
      suscripcion: suscripcion("Trimestral", 76),
      anamnesis: anamnesis([
        ["Mecanismo de lesión", "Luxación anterior de hombro derecho en el gesto de lanzamiento, con reducción en pista."],
        ["Antecedentes en la misma zona", "Primer episodio. Sin inestabilidad previa conocida."],
        ["Dolor inicial (EVA 0-10)", "9/10 en el momento de la luxación; 4/10 al alta de urgencias."],
        ["Medicación actual", "Analgesia a demanda las dos primeras semanas."],
        ["Objetivo deportivo", "Volver a lanzar a máxima intensidad como extremo derecha."],
        ["Expectativa de vuelta", "Le han dicho 3-4 meses; quiere entender el plan por fases."],
        ["Decisión quirúrgica", "Tratamiento conservador de entrada, con reevaluación a las 4 semanas."],
      ]),
      notas: [
        nota(iso(-14), "Primera visita. Sin cirugía por ahora — se opta por tratamiento conservador con reevaluación en 4 semanas."),
      ],
      hitos: [
        hito(iso(-14), "Luxación anterior de hombro en lanzamiento", "lesion"),
        hito(iso(-14), "Inicio de readaptación — Fase 1", "cambio-fase"),
        hito(iso(-7), "Primera valoración isométrica de hombro", "test"),
      ],
      // Recién llegada: radar incompleto (solo 4 de los 12 ejes tienen medición).
      perfilFisico: perfilParcial(
        ["Fuerza explosiva", "Fuerza máxima", "Velocidad máxima", "Agilidad-COD"],
        [
          [26.4, 27.1, 1.0],
          [1.32, 1.36, 1.1],
          [7.1, 7.15, 1.5],
          [2.6, 2.58, 1.0],
        ]
      ),
      // Datos escasos: solo 2 semanas de antigüedad, no hay ACWR calculable todavía.
      acwr: acwrSemanas(1, [95, 110]),
      evolucion: evolucionPuntos(
        [iso(-14), iso(-7), iso(0)],
        [4, 3, 3],
        [90, 105, 110],
        [4, 4, 5],
        [4, 4, 5]
      ),
    });

    registrosTests.push(
      regValorUnico(atletaId, "IMTP", iso(-7), { "Peak force": 2050, "Fuerza relativa": 30.1, RFD: 5200 }),
      regValorUnico(atletaId, "Illinois", iso(-7), { Tiempo: 17.8 }),
      regCuestionario(atletaId, "NPRS", iso(-1), 3)
    );
  }

  // ===== 5. Rubén Campos — Crossfit — Lumbalgia — Fase 1 (dolor reciente alto) =====
  {
    const atletaId = "ruben-campos";
    atletas.push({
      id: atletaId,
      nombre: "Rubén Campos",
      deporte: "Crossfit",
      lesion: "Lumbalgia mecánica",
      lesionDetalle: "Lumbalgia mecánica inespecífica tras sesión de peso muerto con volumen elevado. Sin banderas rojas, sin irradiación.",
      fase: "Fase 1 · Control del dolor",
      semanaProceso: 5,
      avatarInitials: "RC",
      sexo: "Hombre",
      email: "ruben.campos@example.com",
      telefono: "+34 655 666 777",
      fechaNacimiento: "1993-02-08",
      fechaInicioTratamiento: iso(-35),
      estado: "activo",
      // Sin entrenador asignado a propósito (caso vacío de la UI de asignación).
      suscripcion: suscripcion("Mensual", 14),
      anamnesis: anamnesis([
        ["Mecanismo de lesión", "Dolor lumbar tras una sesión de peso muerto con volumen muy por encima de lo habitual."],
        ["Antecedentes en la misma zona", "Dos episodios de lumbalgia autolimitada en los últimos 3 años."],
        ["Dolor inicial (EVA 0-10)", "7/10, mecánico, sin irradiación ni déficit neurológico."],
        ["Medicación actual", "Antiinflamatorio a demanda los primeros 10 días."],
        ["Objetivo deportivo", "Volver a competir en crossfit sin limitar el peso muerto."],
        ["Expectativa de vuelta", "Quiere entrenar a tope ya; se trabaja la dosificación de carga."],
        ["Banderas rojas", "Ninguna: sin pérdida de fuerza, sin dolor nocturno, sin alteración de esfínteres."],
        ["Adherencia previa", "Tiende a entrenar por su cuenta al mejorar los síntomas."],
      ]),
      notas: [
        nota(iso(-35), "Inicio con dolor agudo 7/10 tras sesión de peso muerto. Reposo relativo y educación en dolor."),
        nota(iso(-3), "Repunte de dolor tras volver a entrenar por su cuenta sin autorización — se refuerza la pauta de carga controlada."),
      ],
      hitos: [
        hito(iso(-35), "Lumbalgia aguda tras sesión de peso muerto", "lesion"),
        hito(iso(-35), "Inicio de readaptación — Fase 1", "cambio-fase"),
        hito(iso(-21), "Reevaluación: mejoría de rango sin dolor", "test"),
        hito(iso(-3), "Repunte de dolor por entrenamiento no autorizado", "otro"),
      ],
      perfilFisico: perfilParcial(
        ["Fuerza máxima", "Fuerza explosiva", "Cambio de dirección"],
        [
          [1.55, 1.62, 1.6],
          [34.2, 35.5, 1.2],
          [0.46, 0.44, 1.0],
        ]
      ),
      acwr: acwrSemanas(1, [310, 340, 120, 260, 300]),
      evolucion: evolucionPuntos(
        [iso(-35), iso(-28), iso(-21), iso(-14), iso(-7), iso(0)],
        [7, 6, 4, 4, 3, 6],
        [80, 150, 220, 260, 300, 130],
        [3, 4, 5, 5, 6, 5],
        // Readiness bajo, con recaída clara al repuntar el dolor.
        [3, 4, 5, 6, 6, 4]
      ),
    });

    registrosTests.push(
      regValorUnico(atletaId, "ROM cadera", iso(-21), { Grados: 34 }),
      regValorUnico(atletaId, "ROM cadera", iso(-3), { Grados: 41 }),
      regValorUnico(atletaId, "1RM estimado", iso(-21), { Carga: 92, "Fuerza relativa": 1.12 }),
      regCuestionario(atletaId, "LEFS", iso(-21), 48),
      regCuestionario(atletaId, "LEFS", iso(-3), 52),
      regCuestionario(atletaId, "NPRS", iso(0), 6)
    );
  }

  // ===== 6. Marta Iglesias — Tenis — HSI isquiotibiales — Fase 2 (déficit simetría) =====
  {
    const atletaId = "marta-iglesias";
    atletas.push({
      id: atletaId,
      nombre: "Marta Iglesias",
      deporte: "Tenis",
      lesion: "Lesión de isquiotibiales (HSI)",
      lesionDetalle: "Rotura miofascial de bíceps femoral izquierdo en sprint durante un punto, grado II.",
      fase: "Fase 2 · Fuerza excéntrica",
      semanaProceso: 9,
      avatarInitials: "MI",
      sexo: "Mujer",
      email: "marta.iglesias@example.com",
      telefono: "+34 666 777 888",
      fechaNacimiento: "1998-09-23",
      fechaInicioTratamiento: iso(-63),
      estado: "activo",
      entrenadorId: "jorge-lema",
      suscripcion: suscripcion("Readaptación completa", 117),
      anamnesis: anamnesis([
        ["Mecanismo de lesión", "Dolor brusco en cara posterior del muslo izquierdo esprintando a por una dejada."],
        ["Antecedentes en la misma zona", "Sobrecarga isquiotibial izquierda la temporada pasada, sin baja."],
        ["Dolor inicial (EVA 0-10)", "7/10 al caminar las primeras 48 h."],
        ["Medicación actual", "Ninguna."],
        ["Objetivo deportivo", "Volver al circuito de tenis sin limitar el sprint ni el resto."],
        ["Expectativa de vuelta", "Torneo objetivo en 8 semanas."],
        ["Carga de entrenamiento previa", "6 sesiones de pista + 3 de gimnasio por semana."],
      ]),
      notas: [
        nota(iso(-49), "Buena tolerancia a isometría en longitud larga. Se introduce Nordic curl asistido."),
        nota(iso(-7), "Déficit de fuerza excéntrica todavía relevante en el Nordic — se mantiene precaución con el sprint máximo."),
      ],
      hitos: [
        hito(iso(-63), "Rotura de bíceps femoral izq. en sprint", "lesion"),
        hito(iso(-63), "Inicio de readaptación — Fase 1", "cambio-fase"),
        hito(iso(-49), "Ecografía de control: buena evolución de la cicatriz", "test"),
        hito(iso(-35), "Cambio a Fase 2 — fuerza excéntrica", "cambio-fase"),
        hito(iso(-14), "Test de Nordic y dinamometría isquiotibial", "test"),
        hito(iso(-7), "Test de sprint 10 m", "test"),
      ],
      perfilFisico: perfilCompleto([
        [25.4, 30.2, 1.0],
        [28.6, 31.4, 1.2],
        [155, 168, 1.1],
        [1.05, 1.22, 1.2],
        [0.6, 0.71, 0.9],
        [1.02, 1.24, 1.2],
        [6.9, 6.6, 1.4],
        [3.24, 3.12, 1.2],
        [2.5, 2.36, 1.0],
        [0.39, 0.47, 1.0],
        [2.9, 2.71, 0.9],
        [17.1, 18.4, 1.6],
      ]),
      acwr: acwrSemanas(1, [180, 210, 230, 240, 235, 250, 245, 260, 255]),
      evolucion: evolucionPuntos(
        [iso(-56), iso(-49), iso(-42), iso(-35), iso(-28), iso(-21), iso(-14), iso(-7), iso(0)],
        [5, 4, 3, 3, 2, 2, 2, 1, 1],
        [150, 170, 190, 205, 220, 232, 240, 250, 255],
        [4, 4, 5, 5, 5, 6, 6, 6, 6],
        [5, 5, 6, 6, 7, 7, 7, 8, 8]
      ),
    });

    registrosTests.push(
      // Déficit de simetría <85% en Nordic — signal narrativa.
      regUnilateral(atletaId, "Nordic", iso(-35), { Fuerza: { izq: 195, der: 305 } }),
      regUnilateral(atletaId, "Nordic", iso(-14), { Fuerza: { izq: 228, der: 312 } }),
      regUnilateral(atletaId, "Dinamometría isquios", iso(-14), { Fuerza: { izq: 178, der: 224 } }),
      regUnilateral(atletaId, "SL CMJ", iso(-14), { Altura: { izq: 17.6, der: 19.2 } }),
      regValorUnico(atletaId, "Sprint 10m", iso(-35), { Tiempo: 1.92 }),
      regValorUnico(atletaId, "Sprint 10m", iso(-7), { Tiempo: 1.78 }),
      regCuestionario(atletaId, "NPRS", iso(-2), 1)
    );
  }

  // ===== 7. Pol Serra — Trail running — Condropatía rotuliana — Fase 2 (ACWR riesgo) =====
  {
    const atletaId = "pol-serra";
    atletas.push({
      id: atletaId,
      nombre: "Pol Serra",
      deporte: "Trail running",
      lesion: "Condropatía rotuliana",
      lesionDetalle: "Dolor femoropatelar anterior bilateral (predominio derecho) por incremento brusco de volumen de entrenamiento en montaña.",
      fase: "Fase 2 · Fuerza y control de carga",
      semanaProceso: 10,
      avatarInitials: "PS",
      sexo: "Hombre",
      email: "pol.serra@example.com",
      telefono: "+34 677 888 999",
      fechaNacimiento: "1995-01-27",
      fechaInicioTratamiento: iso(-70),
      estado: "activo",
      entrenadorId: "alex-rios",
      suscripcion: suscripcion("Trimestral", 52),
      anamnesis: anamnesis([
        ["Mecanismo de lesión", "Dolor femoropatelar progresivo tras doblar el desnivel semanal preparando un ultra."],
        ["Antecedentes en la misma zona", "Dolor anterior de rodilla derecha ocasional en bajadas largas."],
        ["Dolor inicial (EVA 0-10)", "5/10 al bajar escaleras y en sedestación prolongada."],
        ["Medicación actual", "Ninguna."],
        ["Objetivo deportivo", "Terminar un ultra trail de 60 km a final de temporada."],
        ["Expectativa de vuelta", "Retomar el desnivel progresivo en 4-6 semanas."],
        ["Carga de entrenamiento previa", "70-90 km y 3.000 m de desnivel positivo por semana."],
        ["Adherencia previa", "Le cuesta respetar las semanas de descarga."],
      ]),
      notas: [
        nota(iso(-56), "Dolor anterior de rodilla con la sedestación prolongada y al bajar escaleras. Se introduce fuerza de cuádriceps en rango sin dolor."),
        nota(iso(-3), "Retomó rodaje de montaña por su cuenta este fin de semana — ACWR de la semana muy por encima de lo planificado."),
      ],
      hitos: [
        hito(iso(-70), "Dolor femoropatelar tras incremento brusco de volumen", "lesion"),
        hito(iso(-70), "Inicio de readaptación — Fase 1", "cambio-fase"),
        hito(iso(-42), "Cambio a Fase 2 — fuerza y control de carga", "cambio-fase"),
        hito(iso(-21), "Test de ROM de rodilla y dinamometría de cuádriceps", "test"),
        hito(iso(-3), "Rodaje de montaña no planificado — pico de carga", "otro"),
      ],
      perfilFisico: perfilCompleto([
        [27.8, 31.4, 1.0],
        [30.2, 33.6, 1.1],
        [165, 178, 1.1],
        [1.1, 1.28, 1.2],
        [0.61, 0.7, 0.9],
        [1.35, 1.58, 1.3],
        [6.6, 6.75, 1.4],
        [3.05, 3.0, 1.3],
        [2.35, 2.42, 1.0],
        [0.44, 0.49, 0.9],
        [2.4, 2.55, 0.9],
        [19.5, 20.6, 1.6],
      ]),
      acwr: acwrSemanas(1, [340, 360, 355, 370, 365, 380, 375, 390, 385, 650]),
      evolucion: evolucionPuntos(
        [iso(-56), iso(-49), iso(-42), iso(-35), iso(-28), iso(-21), iso(-14), iso(-7), iso(0)],
        [5, 4, 4, 3, 3, 3, 2, 2, 3],
        [340, 355, 360, 365, 370, 375, 380, 385, 650],
        [5, 5, 5, 6, 6, 6, 6, 6, 7],
        // Cae en el último punto: rodaje de montaña no planificado.
        [5, 6, 6, 7, 7, 7, 8, 8, 6]
      ),
    });

    registrosTests.push(
      regUnilateral(atletaId, "SL CMJ", iso(-21), { Altura: { izq: 21.2, der: 20.4 } }),
      regUnilateral(atletaId, "Dinamometría cuádriceps", iso(-21), { Fuerza: { izq: 340, der: 358 } }),
      regValorUnico(atletaId, "ROM rodilla flexión", iso(-21), { Grados: 128 }),
      regValorUnico(atletaId, "ROM rodilla extensión", iso(-21), { Grados: 0 }),
      regCuestionario(atletaId, "LEFS", iso(-42), 52),
      regCuestionario(atletaId, "LEFS", iso(-7), 66)
    );
  }

  // ===== 8. Carla Domenech — Pádel — Fractura por estrés — Fase 3 (formulario pendiente) =====
  {
    const atletaId = "carla-domenech";
    atletas.push({
      id: atletaId,
      nombre: "Carla Domenech",
      deporte: "Pádel",
      lesion: "Fractura por estrés (2º metatarsiano)",
      lesionDetalle: "Fractura por estrés del 2º metatarsiano del pie derecho, sin desplazamiento. Consolidación radiológica confirmada.",
      fase: "Fase 3 · Retorno a superficie de juego",
      semanaProceso: 13,
      avatarInitials: "CD",
      sexo: "Mujer",
      email: "carla.domenech@example.com",
      telefono: "+34 688 999 000",
      fechaNacimiento: "2000-04-15",
      fechaInicioTratamiento: iso(-91),
      estado: "activo",
      entrenadorId: "alex-rios",
      suscripcion: suscripcion("Readaptación completa", 61),
      anamnesis: anamnesis([
        ["Mecanismo de lesión", "Dolor progresivo en el antepié derecho tras encadenar torneos en pista dura."],
        ["Antecedentes en la misma zona", "Ninguno. Sin fracturas previas."],
        ["Dolor inicial (EVA 0-10)", "6/10 al apoyar en carga, 2/10 en reposo."],
        ["Medicación actual", "Suplementación de vitamina D pautada por su médico."],
        ["Objetivo deportivo", "Volver a competir en pádel a nivel amateur alto."],
        ["Expectativa de vuelta", "Reintroducción a pista en las próximas semanas."],
        ["Consolidación radiológica", "Confirmada en el control de las 8 semanas."],
      ]),
      notas: [
        nota(iso(-77), "Alta de descarga por parte de traumatología. Progresión de carga en cinta según protocolo."),
        nota(iso(-14), "Buena tolerancia a los primeros hops. Se planifica reintroducción a pista la próxima semana."),
      ],
      hitos: [
        hito(iso(-91), "Diagnóstico de fractura por estrés 2º metatarsiano", "lesion"),
        hito(iso(-91), "Inicio de readaptación — Fase 1 (descarga)", "cambio-fase"),
        hito(iso(-77), "Alta de descarga — apoyo completo autorizado", "otro"),
        hito(iso(-56), "Cambio a Fase 2 — carga progresiva", "cambio-fase"),
        hito(iso(-28), "Cambio a Fase 3 — retorno a superficie de juego", "cambio-fase"),
        hito(iso(-14), "Batería de hops y sprint", "test"),
      ],
      perfilFisico: perfilCompleto([
        [24.6, 29.8, 1.0],
        [26.8, 30.5, 1.1],
        [150, 162, 1.1],
        [0.9, 1.1, 1.1],
        [0.58, 0.69, 0.9],
        [0.95, 1.15, 1.1],
        [6.0, 5.85, 1.4],
        [3.28, 3.2, 1.2],
        [2.58, 2.44, 1.0],
        [0.4, 0.46, 1.0],
        [2.95, 2.8, 0.9],
        [16.4, 17.6, 1.6],
      ]),
      acwr: acwrSemanas(1, [150, 175, 195, 210, 225, 235, 240, 250, 245, 260, 255, 265, 260]),
      evolucion: evolucionPuntos(
        [iso(-56), iso(-49), iso(-42), iso(-35), iso(-28), iso(-21), iso(-14), iso(-7), iso(0)],
        [3, 3, 2, 2, 2, 1, 1, 1, 0],
        [175, 195, 210, 225, 235, 240, 250, 255, 260],
        [4, 4, 5, 5, 5, 6, 6, 6, 6],
        [6, 6, 7, 7, 7, 8, 8, 8, 9]
      ),
    });

    registrosTests.push(
      regUnilateral(atletaId, "Single hop", iso(-14), { Distancia: { izq: 158, der: 149 } }),
      regUnilateral(atletaId, "Triple hop", iso(-14), { Distancia: { izq: 452, der: 431 } }),
      regValorUnico(atletaId, "Sprint 10m", iso(-14), { Tiempo: 1.88 }),
      regValorUnico(atletaId, "ROM tobillo dorsiflexión", iso(-28), { Grados: 33, Distancia: 9.5 }),
      regValorUnico(atletaId, "ROM tobillo dorsiflexión", iso(-14), { Grados: 39, Distancia: 11.6 }),
      regCuestionario(atletaId, "LEFS", iso(-14), 64)
    );
  }

  // ===== 9. Iván Roldán — Hockey hierba — Pubalgia — Fase 4 =====
  {
    const atletaId = "ivan-roldan";
    atletas.push({
      id: atletaId,
      nombre: "Iván Roldán",
      deporte: "Hockey hierba",
      lesion: "Pubalgia del deportista",
      lesionDetalle: "Pubalgia atlética con componente de sobrecarga aductora, de instauración progresiva por volumen de golpeo.",
      fase: "Fase 4 · Readaptación al campo",
      semanaProceso: 19,
      avatarInitials: "IR",
      sexo: "Hombre",
      email: "ivan.roldan@example.com",
      telefono: "+34 699 000 111",
      fechaNacimiento: "1994-10-02",
      fechaInicioTratamiento: iso(-133),
      estado: "activo",
      entrenadorId: "alex-rios",
      suscripcion: suscripcion("Readaptación completa", 175),
      anamnesis: anamnesis([
        ["Mecanismo de lesión", "Dolor inguinal de instauración progresiva por volumen alto de golpeo y giros."],
        ["Antecedentes en la misma zona", "Sobrecarga aductora recurrente en pretemporada desde hace 3 años."],
        ["Dolor inicial (EVA 0-10)", "5/10 al golpear y al esprintar; 2/10 en reposo."],
        ["Medicación actual", "Ninguna."],
        ["Objetivo deportivo", "Competir la temporada completa sin recaídas de pubalgia."],
        ["Expectativa de vuelta", "Reincorporación al entrenamiento de equipo esta misma semana."],
        ["Carga de entrenamiento previa", "4 sesiones + 1 partido, con mucho golpeo unilateral."],
      ]),
      notas: [
        nota(iso(-98), "Buena respuesta al programa de Copenhagen adductor. Dolor con la resistencia isométrica en descenso."),
        nota(iso(-7), "Tolera bien el golpeo a máxima intensidad. Se planifica reincorporación a entrenamiento de equipo."),
      ],
      hitos: [
        hito(iso(-133), "Inicio de dolor inguinal progresivo por sobrecarga", "lesion"),
        hito(iso(-133), "Inicio de readaptación — Fase 1", "cambio-fase"),
        hito(iso(-105), "Cambio a Fase 2 — fuerza aductora isométrica", "cambio-fase"),
        hito(iso(-70), "Cambio a Fase 3 — fuerza dinámica y rotación", "cambio-fase"),
        hito(iso(-28), "Cambio a Fase 4 — readaptación al campo", "cambio-fase"),
        hito(iso(-14), "Test de dinamometría de aductores y ROM de cadera", "test"),
        hito(iso(-7), "Tolerancia completa al golpeo a máxima intensidad", "otro"),
      ],
      perfilFisico: perfilCompleto([
        [30.2, 39.6, 1.1],
        [28.4, 38.1, 1.0],
        [175, 205, 1.0],
        [0.7, 1.9, 1.0],
        [0.6, 0.98, 0.9],
        [1.45, 2.05, 1.2],
        [6.95, 7.5, 1.6],
        [2.98, 3.02, 1.5],
        [2.2, 2.48, 1.0],
        [0.29, 0.55, 1.0],
        [1.75, 2.0, 0.9],
        [20.6, 23.5, 1.7],
      ]),
      acwr: acwrSemanas(1, [
        480, 500, 520, 510, 530, 545, 540, 555, 560, 565, 570, 575, 580, 585, 590, 595,
      ]),
      evolucion: evolucionPuntos(
        [iso(-56), iso(-49), iso(-42), iso(-35), iso(-28), iso(-21), iso(-14), iso(-7), iso(0)],
        [3, 3, 2, 2, 1, 1, 1, 0, 0],
        [500, 520, 535, 545, 555, 565, 575, 585, 595],
        [5, 5, 6, 6, 6, 6, 7, 7, 7],
        [7, 7, 8, 8, 8, 9, 9, 9, 9]
      ),
    });

    registrosTests.push(
      regUnilateral(atletaId, "Dinamometría aductores", iso(-28), { Fuerza: { izq: 190, der: 205 } }),
      regUnilateral(atletaId, "Dinamometría aductores", iso(-14), { Fuerza: { izq: 224, der: 233 } }),
      regValorUnico(atletaId, "ROM cadera", iso(-14), { Grados: 44 }),
      regValorUnico(atletaId, "1RM estimado", iso(-28), { Carga: 105, "Fuerza relativa": 1.28 }),
      regValorUnico(atletaId, "5RM", iso(-14), { Carga: 118 }),
      regCuestionario(atletaId, "LEFS", iso(-28), 58),
      regCuestionario(atletaId, "LEFS", iso(-7), 74)
    );
  }

  // ===== 10. Sofía Marín — Voleibol — Menisco — Alta reciente (caso de éxito) =====
  {
    const atletaId = "sofia-marin";
    atletas.push({
      id: atletaId,
      nombre: "Sofía Marín",
      deporte: "Voleibol",
      lesion: "Meniscectomía parcial (menisco externo)",
      lesionDetalle: "Rotura de menisco externo en apoyo tras remate, meniscectomía parcial artroscópica. Proceso completado con éxito.",
      fase: "Alta · Readaptación completada",
      semanaProceso: 24,
      avatarInitials: "SM",
      sexo: "Mujer",
      email: "sofia.marin@example.com",
      telefono: "+34 610 111 222",
      fechaNacimiento: "1998-12-11",
      fechaInicioTratamiento: iso(-168),
      estado: "alta",
      // Sin entrenador asignado: dada de alta, ya no ocupa plaza de nadie.
      // Sin suscripción activa: el plan venció con el alta deportiva.
      anamnesis: anamnesis([
        ["Mecanismo de lesión", "Dolor y bloqueo de rodilla en la recepción de un remate, con rotación de la tibia."],
        ["Antecedentes en la misma zona", "Ninguno previo en esa rodilla."],
        ["Dolor inicial (EVA 0-10)", "6/10 con bloqueo mecánico intermitente antes de la cirugía."],
        ["Medicación actual", "Ninguna."],
        ["Objetivo deportivo", "Volver a jugar de central en su equipo de voleibol."],
        ["Expectativa de vuelta", "Reincorporación completa al equipo en 5-6 meses."],
        ["Evolución postquirúrgica", "Sin derrame ni bloqueos desde la meniscectomía parcial."],
      ]),
      notas: [
        nota(iso(-105), "Evolución muy favorable desde el inicio, sin derrame ni bloqueos tras la cirugía."),
        nota(iso(0), "Alta deportiva: simetría, fuerza y cuestionarios de rodilla en objetivo. Reincorporada al equipo con normalidad."),
      ],
      hitos: [
        hito(iso(-168), "Rotura de menisco externo en remate", "lesion"),
        hito(iso(-161), "Meniscectomía parcial artroscópica", "cirugia"),
        hito(iso(-154), "Inicio de readaptación — Fase 1", "cambio-fase"),
        hito(iso(-119), "Cambio a Fase 2 — fuerza y control neuromuscular", "cambio-fase"),
        hito(iso(-77), "Cambio a Fase 3 — pliometría y readaptación al campo", "cambio-fase"),
        hito(iso(-35), "Cambio a Fase 4 — entrenamiento con el equipo", "cambio-fase"),
        hito(iso(-14), "Batería final de tests — objetivos superados", "test"),
        hito(iso(0), "Alta deportiva completa", "alta"),
      ],
      perfilFisico: perfilCompleto([
        [29.8, 38.4, 1.0],
        [28.2, 37.6, 1.1],
        [162, 195, 1.1],
        [1.15, 1.55, 1.2],
        [0.7, 1.05, 0.9],
        [1.1, 1.42, 1.1],
        [6.2, 5.95, 1.4],
        [3.35, 3.22, 1.2],
        [2.62, 2.4, 1.0],
        [0.42, 0.51, 1.0],
        [2.98, 2.75, 0.9],
        [17.9, 19.8, 1.6],
      ]),
      acwr: acwrSemanas(1, [420, 440, 450, 460, 455, 465, 470, 460, 465, 470, 468, 472]),
      evolucion: evolucionPuntos(
        [iso(-56), iso(-49), iso(-42), iso(-35), iso(-28), iso(-21), iso(-14), iso(-7), iso(0)],
        [1, 1, 0, 0, 0, 0, 0, 0, 0],
        [430, 445, 455, 460, 465, 468, 470, 472, 470],
        [5, 5, 6, 6, 6, 6, 6, 6, 6],
        [8, 8, 9, 9, 9, 9, 9, 10, 10]
      ),
    });

    registrosTests.push(
      regUnilateral(atletaId, "SL CMJ", iso(-28), { Altura: { izq: 22.4, der: 23.1 } }),
      regUnilateral(atletaId, "SL CMJ", iso(-14), { Altura: { izq: 24.6, der: 24.9 } }),
      regUnilateral(atletaId, "Dinamometría cuádriceps", iso(-14), { Fuerza: { izq: 372, der: 385 } }),
      regUnilateral(atletaId, "Dinamometría isquios", iso(-14), { Fuerza: { izq: 235, der: 242 } }),
      regUnilateral(atletaId, "Single hop", iso(-14), { Distancia: { izq: 210, der: 216 } }),
      regUnilateral(atletaId, "Triple hop", iso(-14), { Distancia: { izq: 605, der: 618 } }),
      regCuestionario(atletaId, "IKDC", iso(-14), 91),
      regCuestionario(atletaId, "KOOS", iso(-14), 93)
    );
  }

  // ---------------------------------------------------------------------------
  // Sesiones y bloques semanales — fechas reales relativas a `hoy`.
  // Semana pasada: completadas. Esta semana + siguiente: programadas.
  // Repartidas para que HOY caigan 5 sesiones/revisiones entre los 9 activos.
  // ---------------------------------------------------------------------------

  type PlanAtleta = {
    atletaId: string;
    nombre: string;
    objetivo: string;
    offsetHoy: number; // día de "esta semana" que cae hoy (0) o cerca (±1/±2)
    sesion: (offset: number) => EjercicioProgramado[];
  };

  const planes: PlanAtleta[] = [
    {
      atletaId: "marcos-vidal",
      nombre: "Semana 14 · Readaptación al campo",
      objetivo:
        "Progresar la carga en tren inferior y reintroducir gestos pliométricos y de campo, controlando el dolor y verificando simetría antes de aumentar la exposición a cambios de dirección.",
      offsetHoy: 0,
      sesion: () => [EJ.bulgara(), EJ.pesoMuertoUnaPierna(), EJ.talonesUnilateral(), EJ.nordic()],
    },
    {
      atletaId: "laura-saez",
      nombre: "Semana 8 · Reintroducción a carrera",
      objetivo: "Progresar el volumen de carrera continua sin dolor, manteniendo fuerza de tríceps sural.",
      offsetHoy: 0,
      sesion: () => [EJ.talonesUnilateral(), EJ.movilidadTobillo(), EJ.marchaBanda()],
    },
    {
      atletaId: "diego-torres",
      nombre: "Semana 20 · Alta próxima",
      objetivo: "Confirmar simetría y tolerancia a pliometría de alta intensidad antes del alta deportiva.",
      offsetHoy: -1,
      sesion: () => [EJ.cmj(), EJ.dropJump(), EJ.hopUnilateral(), EJ.perturbaciones()],
    },
    {
      atletaId: "nerea-otxoa",
      nombre: "Semana 2 · Evaluación y protección",
      objetivo: "Proteger el hombro, mantener movilidad indolora y comenzar activación escapular suave.",
      offsetHoy: 2,
      sesion: () => [EJ.isoQuad(), EJ.equilibrioMonopodal()],
    },
    {
      atletaId: "ruben-campos",
      nombre: "Semana 5 · Control del dolor",
      objetivo: "Reducir el dolor lumbar con carga controlada y educación en manejo de cargas de crossfit.",
      offsetHoy: -2,
      sesion: () => [EJ.puenteGluteo(), EJ.movilidadCadera(), EJ.isoQuad()],
    },
    {
      atletaId: "marta-iglesias",
      nombre: "Semana 9 · Fuerza excéntrica",
      objetivo: "Progresar la fuerza excéntrica de isquiotibiales y reintroducir sprint submáximo.",
      offsetHoy: 0,
      sesion: () => [EJ.nordic(), EJ.pesoMuertoUnaPierna(), EJ.marchaBanda()],
    },
    {
      atletaId: "pol-serra",
      nombre: "Semana 10 · Fuerza y control de carga",
      objetivo: "Fuerza de cuádriceps en rango sin dolor y control de la carga tras el pico de esta semana.",
      offsetHoy: 1,
      sesion: () => [EJ.stepDown(), EJ.isoQuad(), EJ.movilidadCadera()],
    },
    {
      atletaId: "carla-domenech",
      nombre: "Semana 13 · Retorno a superficie de juego",
      objetivo: "Reintroducción a pista de pádel con hops y cambios de dirección controlados.",
      offsetHoy: 0,
      sesion: () => [EJ.hopUnilateral(), EJ.equilibrioMonopodal(), EJ.movilidadTobillo()],
    },
    {
      atletaId: "ivan-roldan",
      nombre: "Semana 19 · Readaptación al campo",
      objetivo: "Entrenamiento de equipo con exposición progresiva a golpeo y cambios de dirección.",
      offsetHoy: -1,
      sesion: () => [EJ.puenteGluteo(), EJ.pesoMuertoUnaPierna(), EJ.perturbaciones()],
    },
  ];

  for (const plan of planes) {
    const semanaPasadaInicio = iso(-9);
    const semanaPasadaFin = iso(-3);
    const sesionesSemanaPasada = [-9, -7, -5].map((offset, i) =>
      crearSesion(
        plan.atletaId,
        iso(offset),
        `${plan.nombre.split(" · ")[1] ?? "Sesión"} (${i + 1})`,
        plan.sesion(offset),
        "completada"
      )
    );
    const bloqueAnterior = crearBloque(
      plan.atletaId,
      plan.nombre.replace(/Semana (\d+)/, (_m, n) => `Semana ${Number(n) - 1}`),
      semanaPasadaInicio,
      semanaPasadaFin,
      plan.objetivo,
      sesionesSemanaPasada
    );

    const offsetsEstaSemana = [plan.offsetHoy - 2, plan.offsetHoy, plan.offsetHoy + 2];
    const sesionesEstaSemana = offsetsEstaSemana.map((offset, i) =>
      crearSesion(
        plan.atletaId,
        iso(offset),
        `${plan.nombre.split(" · ")[1] ?? "Sesión"} (${i + 1})`,
        plan.sesion(offset),
        "programada"
      )
    );
    const bloqueActual = crearBloque(
      plan.atletaId,
      plan.nombre,
      iso(offsetsEstaSemana[0]),
      iso(offsetsEstaSemana[2]),
      plan.objetivo,
      sesionesEstaSemana
    );

    const offsetsSemanaSiguiente = offsetsEstaSemana.map((o) => o + 7);
    const sesionesSemanaSiguiente = offsetsSemanaSiguiente.map((offset, i) =>
      crearSesion(
        plan.atletaId,
        iso(offset),
        `${plan.nombre.split(" · ")[1] ?? "Sesión"} (${i + 1})`,
        plan.sesion(offset),
        "programada"
      )
    );
    const bloqueSiguiente = crearBloque(
      plan.atletaId,
      plan.nombre.replace(/Semana (\d+)/, (_m, n) => `Semana ${Number(n) + 1}`),
      iso(offsetsSemanaSiguiente[0]),
      iso(offsetsSemanaSiguiente[2]),
      plan.objetivo,
      sesionesSemanaSiguiente
    );

    sesiones.push(...sesionesSemanaPasada, ...sesionesEstaSemana, ...sesionesSemanaSiguiente);
    bloques.push(bloqueAnterior, bloqueActual, bloqueSiguiente);
  }

  // ---------------------------------------------------------------------------
  // Formularios: definiciones, envíos (con RegistroTest para los PRO respondidos)
  // ---------------------------------------------------------------------------

  const formulariosDef: FormularioDef[] = [
    {
      id: "form-rpe",
      nombre: "RPE post-sesión",
      descripcion: "Percepción de esfuerzo de la sesión de hoy.",
      campos: [
        { id: "rpe", etiqueta: "RPE de la sesión (0-10)", tipo: "escala-0-10", variableDestino: "rpe" },
      ],
    },
    {
      id: "form-dolor-eva",
      nombre: "Dolor diario EVA",
      descripcion: "Registro diario de dolor en escala visual analógica.",
      campos: [
        { id: "dolor", etiqueta: "Dolor hoy (EVA 0-10)", tipo: "escala-0-10", variableDestino: "dolor" },
      ],
    },
    {
      id: "form-wellness",
      nombre: "Wellness matinal",
      descripcion: "Cuestionario breve de bienestar al levantarse.",
      campos: [
        { id: "sueno", etiqueta: "Horas de sueño", tipo: "numero", variableDestino: null },
        { id: "fatiga", etiqueta: "Fatiga percibida (0-10)", tipo: "escala-0-10", variableDestino: null },
        { id: "animo", etiqueta: "Estado de ánimo (0-10)", tipo: "escala-0-10", variableDestino: null },
      ],
    },
    {
      id: "form-acl-rsi",
      nombre: "ACL-RSI (versión breve)",
      descripcion: "Confianza psicológica para el retorno al deporte tras cirugía de LCA. Versión abreviada de demo.",
      testDefId: testPorNombre(catalogoSemilla, "ACL-RSI").id,
      campos: [
        { id: "confianza-rodilla", etiqueta: "Confío en mi rodilla para el deporte (0-10)", tipo: "escala-0-10" },
        { id: "miedo-relesion", etiqueta: "Miedo a volver a lesionarme (0-10, invertido)", tipo: "escala-0-10" },
        { id: "confianza-competir", etiqueta: "Confianza al competir a máxima intensidad (0-10)", tipo: "escala-0-10" },
        { id: "frustracion", etiqueta: "Frustración por el estado de la rodilla (0-10, invertido)", tipo: "escala-0-10" },
      ],
    },
    {
      id: "form-visa-a",
      nombre: "VISA-A (versión breve)",
      descripcion: "Función y síntomas del tendón de Aquiles. Versión abreviada de demo.",
      testDefId: testPorNombre(catalogoSemilla, "VISA-A").id,
      campos: [
        { id: "rigidez-matinal", etiqueta: "Rigidez matinal del tendón (0-10, invertido)", tipo: "escala-0-10" },
        { id: "dolor-al-cargar", etiqueta: "Dolor al cargar el tendón (0-10, invertido)", tipo: "escala-0-10" },
        { id: "funcion-carrera", etiqueta: "Capacidad de correr sin dolor (0-10)", tipo: "escala-0-10" },
        { id: "nivel-actividad", etiqueta: "Nivel de actividad deportiva actual (0-10)", tipo: "escala-0-10" },
      ],
    },
    {
      id: "form-nprs",
      nombre: "NPRS — Escala numérica de dolor",
      descripcion: "Dolor actual en escala numérica 0-10 (instrumento de un único ítem).",
      testDefId: testPorNombre(catalogoSemilla, "NPRS").id,
      campos: [{ id: "dolor-actual", etiqueta: "Dolor ahora mismo (0-10)", tipo: "escala-0-10" }],
    },
  ];

  const formulariosEnvios: FormularioEnvio[] = [];

  function envioRespondido(
    formularioId: string,
    atletaId: string,
    offsetEnvio: number,
    offsetRespuesta: number,
    respuestas: Record<string, string | number>
  ): FormularioEnvio {
    return {
      id: id("envio"),
      formularioId,
      atletaId,
      fechaEnvio: iso(offsetEnvio),
      estado: "respondido",
      respuestas,
      fechaRespuesta: iso(offsetRespuesta),
    };
  }

  function envioPendiente(formularioId: string, atletaId: string, offsetEnvio: number): FormularioEnvio {
    return {
      id: id("envio"),
      formularioId,
      atletaId,
      fechaEnvio: iso(offsetEnvio),
      estado: "pendiente",
    };
  }

  formulariosEnvios.push(
    envioRespondido("form-rpe", "marcos-vidal", -1, -1, { rpe: 8 }),
    envioRespondido("form-dolor-eva", "marcos-vidal", 0, 0, { dolor: 2 }),
    envioRespondido("form-acl-rsi", "marcos-vidal", -56, -56, {
      "confianza-rodilla": 3,
      "miedo-relesion": 3,
      "confianza-competir": 3,
      frustracion: 4,
    }),
    envioRespondido("form-acl-rsi", "marcos-vidal", -14, -14, {
      "confianza-rodilla": 7,
      "miedo-relesion": 6,
      "confianza-competir": 7,
      frustracion: 7,
    }),

    envioRespondido("form-visa-a", "laura-saez", -49, -48, {
      "rigidez-matinal": 3,
      "dolor-al-cargar": 3,
      "funcion-carrera": 5,
      "nivel-actividad": 4,
    }),
    envioRespondido("form-visa-a", "laura-saez", -7, -6, {
      "rigidez-matinal": 6,
      "dolor-al-cargar": 6,
      "funcion-carrera": 8,
      "nivel-actividad": 7,
    }),
    envioRespondido("form-wellness", "laura-saez", 0, 0, { sueno: 7.5, fatiga: 3, animo: 8 }),

    envioRespondido("form-nprs", "diego-torres", -1, -1, { "dolor-actual": 0 }),
    envioRespondido("form-rpe", "diego-torres", -1, -1, { rpe: 6 }),

    envioRespondido("form-nprs", "nerea-otxoa", -1, -1, { "dolor-actual": 3 }),

    envioRespondido("form-nprs", "ruben-campos", 0, 0, { "dolor-actual": 6 }),
    envioRespondido("form-dolor-eva", "ruben-campos", 0, 0, { dolor: 6 }),

    envioRespondido("form-nprs", "marta-iglesias", -2, -2, { "dolor-actual": 1 }),
    envioRespondido("form-rpe", "marta-iglesias", -1, -1, { rpe: 6 }),

    // Formulario sin responder hace >48h — señal narrativa.
    envioPendiente("form-wellness", "pol-serra", -3),

    envioPendiente("form-dolor-eva", "carla-domenech", -1),

    envioRespondido("form-nprs", "ivan-roldan", -1, -1, { "dolor-actual": 0 }),

    envioRespondido("form-acl-rsi", "sofia-marin", -14, -14, {
      "confianza-rodilla": 9,
      "miedo-relesion": 8,
      "confianza-competir": 9,
      frustracion: 9,
    })
  );

  // Los cuestionarios PRO respondidos generan también su RegistroTest.
  registrosTests.push(
    regCuestionario("marcos-vidal", "ACL-RSI", iso(-56), 34),
    regCuestionario("marcos-vidal", "ACL-RSI", iso(-14), 68),
    regCuestionario("laura-saez", "VISA-A", iso(-48), 41),
    regCuestionario("laura-saez", "VISA-A", iso(-6), 71),
    regCuestionario("diego-torres", "NPRS", iso(-1), 0),
    regCuestionario("nerea-otxoa", "NPRS", iso(-1), 3),
    regCuestionario("ruben-campos", "NPRS", iso(0), 6),
    regCuestionario("marta-iglesias", "NPRS", iso(-2), 1),
    regCuestionario("ivan-roldan", "NPRS", iso(-1), 0),
    regCuestionario("sofia-marin", "ACL-RSI", iso(-14), 88)
  );
  // (Nota: algunos de estos duplican registros ya sembrados arriba junto al
  // resto de tests de ese atleta — es intencional: representan la misma
  // medición vista desde el histórico de tests y desde el envío de
  // formulario que la originó, coherente con `testDefId`.)

  // ---------------------------------------------------------------------------
  // Ampliación de registrosTests — histórico para TODOS los tests del catálogo.
  //
  // Dos caminos, y ninguno pisa lo escrito a mano arriba:
  // - El par atleta/test YA tiene registros → solo se añade histórico ANTERIOR
  //   al más antiguo, extrapolado desde él. La medición más reciente (de la que
  //   cuelgan los hallazgos de la demo) queda intacta.
  // - El par no tiene registros → serie nueva completa dentro de la ventana del
  //   atleta, según su perfil.
  // ---------------------------------------------------------------------------

  const offsetDeIso = (fechaIso: string): number => {
    const d = new Date(`${fechaIso}T00:00:00`);
    const base = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    return Math.round((d.getTime() - base.getTime()) / 86_400_000);
  };

  const atletasGenerados = Object.keys(PERFILES_SEMILLA);

  atletasGenerados.forEach((atletaId, indiceAtleta) => {
    const perfil = PERFILES_SEMILLA[atletaId];

    catalogoSemilla.forEach((test, indiceTest) => {
      const mejora = mejoraDeTest(test);
      if (mejora === null) return;

      const existentes = registrosTests
        .filter((r) => r.atletaId === atletaId && r.testId === test.id)
        .sort((a, b) => a.fecha.localeCompare(b.fecha));

      if (existentes.length > 0) {
        const aAgregar = REGISTROS_OBJETIVO - existentes.length;
        if (aAgregar <= 0) return;

        const ref = existentes[0];
        const offsetRef = offsetDeIso(ref.fecha);
        const margen = Math.max(aAgregar * 5, offsetRef - perfil.diaInicio);
        const paso = Math.max(5, Math.round(margen / (aAgregar + 1)));
        const decremento = mejora / (aAgregar + 1);

        for (let k = aAgregar; k >= 1; k -= 1) {
          registrosTests.push({
            id: id("reg"),
            atletaId,
            testId: test.id,
            fecha: iso(offsetRef - paso * k),
            valores: valoresRetro(test, ref, decremento, k),
          });
        }
        return;
      }

      // 7 de los 9 atletas generados por test → cada test supera el mínimo de 6.
      const cubierto = (indiceAtleta + indiceTest * 3) % atletasGenerados.length >= 2;
      if (!cubierto) return;

      const semilla = huella(`${atletaId}:${test.id}`);
      const nRegistros = 3 + (semilla % 4);
      const offsetFin = -5 - (semilla % 9);
      const offsetInicio = Math.min(perfil.diaInicio, offsetFin - (nRegistros - 1));

      for (let i = 0; i < nRegistros; i += 1) {
        const p = i / (nRegistros - 1);
        const valores = valoresGenerados(test, perfil, p);
        if (!valores) break;
        registrosTests.push({
          id: id("reg"),
          atletaId,
          testId: test.id,
          fecha: iso(Math.round(lerp(offsetInicio, offsetFin, p))),
          valores,
        });
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Plantillas de sesión y de programa
  // ---------------------------------------------------------------------------

  const plantillasSesion: PlantillaSesion[] = [
    {
      id: "plantilla-fuerza-tren-inferior",
      nombre: "Fuerza tren inferior — unilateral",
      objetivo: "Fuerza unilateral de cadera y rodilla con progresión de carga.",
      categoria: "Fuerza",
      ejercicios: [EJ.bulgara(), EJ.pesoMuertoUnaPierna(), EJ.talonesUnilateral(), EJ.nordic()],
    },
    {
      id: "plantilla-pliometria-control",
      nombre: "Pliometría y control neuromuscular",
      objetivo: "Reintroducción de gestos de salto con control neuromuscular.",
      categoria: "Pliometría",
      ejercicios: [EJ.cmj(), EJ.dropJump(), EJ.perturbaciones(), EJ.equilibrioMonopodal()],
    },
    {
      id: "plantilla-fase1-proteccion",
      nombre: "Fase 1 — protección y activación básica",
      objetivo: "Control del dolor, isometría y movilidad en fase aguda.",
      categoria: "Movilidad",
      ejercicios: [EJ.isoQuad(), EJ.puenteGluteo(), EJ.movilidadTobillo(), EJ.movilidadCadera()],
    },
  ];

  const plantillasPrograma: PlantillaPrograma[] = [
    {
      id: "programa-lca-4-semanas",
      nombre: "Post-LCA · Bloque de 4 semanas (Fase 2→3)",
      descripcion:
        "Progresión de 4 semanas para transición de fuerza de base a pliometría y control neuromuscular tras reconstrucción de LCA.",
      semanas: [
        {
          sesiones: [
            { dia: "Lunes", nombre: "Fuerza tren inferior", ejercicios: [EJ.isoQuad(), EJ.puenteGluteo()], estado: "programada" },
            { dia: "Miércoles", nombre: "Control neuromuscular", ejercicios: [EJ.equilibrioMonopodal(), EJ.perturbaciones()], estado: "programada" },
          ],
        },
        {
          sesiones: [
            { dia: "Lunes", nombre: "Fuerza tren inferior", ejercicios: [EJ.stepDown(), EJ.puenteGluteo()], estado: "programada" },
            { dia: "Jueves", nombre: "Pliometría inicial", ejercicios: [EJ.cmj()], estado: "programada" },
          ],
        },
        {
          sesiones: [
            { dia: "Lunes", nombre: "Fuerza unilateral", ejercicios: [EJ.bulgara(), EJ.pesoMuertoUnaPierna()], estado: "programada" },
            { dia: "Jueves", nombre: "Pliometría y reactividad", ejercicios: [EJ.cmj(), EJ.dropJump()], estado: "programada" },
          ],
        },
        {
          sesiones: [
            { dia: "Lunes", nombre: "Fuerza y hop test", ejercicios: [EJ.bulgara(), EJ.hopUnilateral()], estado: "programada" },
            { dia: "Jueves", nombre: "Readaptación al campo", ejercicios: [EJ.marchaBanda(), EJ.dropJump()], estado: "programada" },
          ],
        },
      ],
    },
    {
      id: "programa-tendinopatia-6-semanas",
      nombre: "Tendinopatía · Bloque de 6 semanas (carga progresiva)",
      descripcion:
        "Progresión isométrica → isotónica → pliométrica para tendinopatías, con reintroducción gradual de carrera.",
      semanas: [
        {
          sesiones: [
            { dia: "Martes", nombre: "Isometría", ejercicios: [EJ.talonesUnilateral()], estado: "programada" },
          ],
        },
        {
          sesiones: [
            { dia: "Martes", nombre: "Isotónico pesado y lento", ejercicios: [EJ.talonesUnilateral(), EJ.movilidadTobillo()], estado: "programada" },
          ],
        },
        {
          sesiones: [
            { dia: "Martes", nombre: "Isotónico + carrera corta", ejercicios: [EJ.talonesUnilateral(), EJ.marchaBanda()], estado: "programada" },
          ],
        },
        {
          sesiones: [
            { dia: "Martes", nombre: "Carga progresiva", ejercicios: [EJ.talonesUnilateral(), EJ.marchaBanda()], estado: "programada" },
          ],
        },
        {
          sesiones: [
            { dia: "Martes", nombre: "Pliometría inicial", ejercicios: [EJ.dropJump()], estado: "programada" },
          ],
        },
        {
          sesiones: [
            { dia: "Martes", nombre: "Readaptación a carrera", ejercicios: [EJ.dropJump(), EJ.marchaBanda()], estado: "programada" },
          ],
        },
      ],
    },
  ];

  // ---------------------------------------------------------------------------
  // Notificaciones (~10) derivadas a mano de las señales narrativas anteriores.
  // ---------------------------------------------------------------------------

  const notificaciones: Notificacion[] = [
    {
      id: id("notif"),
      atletaId: "marcos-vidal",
      tipo: "alerta",
      titulo: "ACWR en zona de riesgo",
      detalle: "El ACWR de Marcos Vidal ha subido a 1.42 esta semana tras un partido amistoso no planificado.",
      fecha: iso(0),
      leida: false,
      completada: false,
      enlace: "/atletas/marcos-vidal?tab=datos",
    },
    {
      id: id("notif"),
      atletaId: "marcos-vidal",
      tipo: "alerta",
      titulo: "Déficit de simetría en hop battery",
      detalle: "Single/Triple/Crossover hop siguen por debajo del 85% de simetría en el lado operado (izq.).",
      fecha: iso(-14),
      leida: true,
      completada: false,
      enlace: "/atletas/marcos-vidal?tab=datos",
    },
    {
      id: id("notif"),
      atletaId: "pol-serra",
      tipo: "alerta",
      titulo: "ACWR en zona de riesgo",
      detalle: "El ACWR de Pol Serra ha subido a 1.71 tras un rodaje de montaña no planificado este fin de semana.",
      fecha: iso(0),
      leida: false,
      completada: false,
      enlace: "/atletas/pol-serra?tab=datos",
    },
    {
      id: id("notif"),
      atletaId: "marta-iglesias",
      tipo: "alerta",
      titulo: "Déficit de fuerza excéntrica en Nordic",
      detalle: "La simetría en Nordic sigue por debajo del 85% (isquiotibial izq.) pese a la mejora reciente.",
      fecha: iso(-14),
      leida: false,
      completada: false,
      enlace: "/atletas/marta-iglesias?tab=datos",
    },
    {
      id: id("notif"),
      atletaId: "ruben-campos",
      tipo: "alerta",
      titulo: "Dolor elevado en el último registro",
      detalle: "Rubén Campos ha registrado un dolor de 6/10 hoy tras entrenar por su cuenta.",
      fecha: iso(0),
      leida: false,
      completada: false,
      enlace: "/atletas/ruben-campos?tab=datos",
    },
    {
      id: id("notif"),
      atletaId: "pol-serra",
      tipo: "recordatorio",
      titulo: "Formulario sin responder",
      detalle: "El wellness matinal enviado a Pol Serra lleva más de 48h sin respuesta.",
      fecha: iso(-1),
      leida: false,
      completada: false,
      enlace: "/atletas/pol-serra?tab=formularios",
    },
    {
      id: id("notif"),
      atletaId: "carla-domenech",
      tipo: "recordatorio",
      titulo: "Formulario sin responder",
      detalle: "El registro de dolor diario enviado a Carla Domenech sigue pendiente.",
      fecha: iso(-1),
      leida: false,
      completada: false,
      enlace: "/atletas/carla-domenech?tab=formularios",
    },
    {
      id: id("notif"),
      atletaId: "nerea-otxoa",
      tipo: "tarea",
      titulo: "Completar perfil físico inicial",
      detalle: "Nerea Otxoa solo tiene 4 de las 12 capacidades del perfil físico medidas — pendiente batería completa.",
      fecha: iso(-7),
      leida: false,
      completada: false,
      enlace: "/atletas/nerea-otxoa?tab=datos",
    },
    {
      id: id("notif"),
      atletaId: "diego-torres",
      tipo: "tarea",
      titulo: "Candidato a alta",
      detalle: "Diego Torres cumple los objetivos de simetría y fuerza — valorar programar el alta deportiva.",
      fecha: iso(-7),
      leida: true,
      completada: false,
      enlace: "/atletas/diego-torres",
    },
    {
      id: id("notif"),
      atletaId: "sofia-marin",
      tipo: "recordatorio",
      titulo: "Alta deportiva completada",
      detalle: "Sofía Marín ha recibido el alta con todos los objetivos superados — caso de éxito.",
      fecha: iso(0),
      leida: true,
      completada: true,
      enlace: "/atletas/sofia-marin",
    },
  ];

  // ---------------------------------------------------------------------------
  // Config
  // ---------------------------------------------------------------------------

  const config: Config = {
    tema: "fisiofles",
    acento: ACENTO_DEFECTO,
    umbrales: { ...UMBRALES_DEFECTO },
    vistaAtletas: "grid",
    dashboardGraficos: GRAFICOS_DASHBOARD_DEFECTO,
    dashboardGraficosOrden: GRAFICOS_DASHBOARD_DEFECTO,
    fichaGraficos: FICHA_GRAFICOS_DEFECTO,
    fichaGraficosOrden: FICHA_GRAFICOS_DEFECTO,
  };

  return {
    atletas,
    entrenadores,
    sesiones,
    bloques,
    ejercicios,
    catalogoTests: catalogoSemilla,
    registrosTests,
    plantillasSesion,
    plantillasPrograma,
    formulariosDef,
    formulariosEnvios,
    notificaciones,
    config,
  };
}
