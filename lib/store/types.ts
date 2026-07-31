/**
 * Modelo de datos v3 — única fuente de verdad para todo lo editable de la
 * demo. Vive en el store (`lib/store/`); `lib/mock/seed.ts` solo aporta los
 * valores iniciales. Ver CLAUDE.md > "Única fuente de verdad".
 */

import type { Capacidad, IntensidadSesion, Sexo } from "@/lib/calculations";
import type { Categoria, Fase, VariableMedible } from "@/lib/mock/ejercicios";
import type { AcentoId } from "@/lib/personalizacion/acentos";

export type { Categoria, Fase, VariableMedible, Capacidad, Sexo, IntensidadSesion };

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

// ---------------------------------------------------------------------------
// Entrenador
// ---------------------------------------------------------------------------

export type Entrenador = {
  id: string;
  nombre: string;
  iniciales: string;
  rol: string;
  /** Nº máximo de atletas que puede llevar — base del cálculo de saturación. */
  capacidadMaxima: number;
};

// ---------------------------------------------------------------------------
// Lesiones y fases — entidades definidas por el profesional (no texto libre).
// Alimentan el semáforo de proceso (lib/calculations/semaforo.ts).
// ---------------------------------------------------------------------------

export type FaseLesion = {
  id: string;
  nombre: string;
  /** Criterios de progresión PARA ENTRAR en esta fase (informativos, checklist clínico). */
  criterios?: string[];
};

export type TipoLesion = {
  id: string;
  nombre: string; // "LCA", "Pubalgia", "Esguince de tobillo"...
  /** Orden del array = orden del proceso = orden del semáforo. */
  fases: FaseLesion[];
  /** Tipo especial "Rendimiento" para atletas sin lesión. No eliminable en UI. */
  esRendimiento?: boolean;
};

// ---------------------------------------------------------------------------
// Atleta
// ---------------------------------------------------------------------------

export type NotaClinica = {
  id: string;
  fecha: string;
  texto: string;
};

export type TipoHito =
  | "lesion"
  | "cirugia"
  | "test"
  | "cambio-fase"
  | "alta"
  | "otro";

export type Hito = {
  id: string;
  fecha: string;
  titulo: string;
  descripcion?: string;
  tipo: TipoHito;
};

export type EstadoAtleta = "activo" | "alta" | "pausa";

/** Cuestionario inicial estático del atleta (pares pregunta/respuesta). */
export type PreguntaAnamnesis = {
  pregunta: string;
  respuesta: string;
};

/** Suscripción del atleta a la plataforma. Fechas ISO yyyy-mm-dd. */
export type Suscripcion = {
  plan: string;
  fechaInicio: string;
  fechaFin: string;
};

/**
 * Punto de evolución diario/semanal del atleta. Valores BRUTOS: dolor, RPE y
 * `readiness` en 0–10 (misma escala, comparten eje en el gráfico de Evolución),
 * carga en sRPE. `readiness` = cuánto de preparado/motivado se siente ese día.
 */
export type PuntoEvolucion = {
  fecha: string;
  dolor: number;
  carga: number;
  rpe: number;
  readiness: number;
};

export type Atleta = {
  id: string;
  nombre: string;
  deporte: string;
  /**
   * Descripción corta del caso concreto ("Fractura por estrés 2º metatarsiano").
   * NO es el tipo de lesión del catálogo (`lesionId` → `TipoLesion.nombre`, ej.
   * "Esguince de tobillo") ni el detalle clínico largo (`lesionDetalle`): son
   * tres niveles distintos y ninguno se deriva de otro. Ver CLAUDE.md.
   */
  lesion: string;
  lesionDetalle?: string;
  /**
   * Modelo v4 de lesiones/fases (ver `TipoLesion`/`FaseLesion`) — única fuente
   * de verdad de la fase desde FASE 8. Opcionales porque el catálogo es
   * editable: borrar un tipo obliga a reasignar (`EliminarLesionDialog`), pero
   * un estado hidratado de una versión anterior puede no traerlos. Resuélvelos
   * SIEMPRE con `useFaseDeAtleta`/`resolverFaseDeAtleta`, que devuelven `null`
   * si no resuelven.
   */
  lesionId?: string;
  faseId?: string;
  semanaProceso: number;
  avatarInitials: string;
  sexo: Sexo;
  email?: string;
  telefono?: string;
  fechaNacimiento?: string;
  fechaInicioTratamiento?: string;
  estado: EstadoAtleta;
  /** Profesional que lleva el caso. Ausente = sin asignar. */
  entrenadorId?: string;
  /** Siempre `undefined` en la semilla: las vistas pintan un icono placeholder. */
  fotoUrl?: string;
  anamnesis?: PreguntaAnamnesis[];
  suscripcion?: Suscripcion;
  notas: NotaClinica[];
  hitos: Hito[];
  /**
   * Perfil físico (radar). `inicial`/`actual` son valores BRUTOS de cada
   * capacidad; el componente los convierte a z-score. `objetivo` ya está en
   * unidades de z-score (criterio clínico fijado por el fisio).
   */
  perfilFisico: { eje: Capacidad; inicial: number; actual: number; objetivo: number }[];
  /** Carga aguda semanal (sRPE), bruta. El componente calcula crónica/ratio/zona. */
  acwr: { semana: string; agudo: number }[];
  evolucion: PuntoEvolucion[];
};

// ---------------------------------------------------------------------------
// Sesiones / programación
// ---------------------------------------------------------------------------

export type EjercicioProgramado = {
  ejercicioId: string;
  series: number;
  repeticiones: string;
  carga: string;
  variablesAMedir: VariableMedible[];
  notas?: string;
  rpeObjetivo?: number;
  descanso?: string; // texto: "90s", "2min"
  ratioSeries?: string; // ratio pierna lesionada:sana, texto: "2:1"
};

/** Sub-bloque ordenado de una sesión (Preparación → Activación → Bloque principal 1..n). */
export type BloqueEjercicios = {
  id: string;
  nombre: string; // "Preparación", "Activación", "Bloque principal 1"...
  ejercicios: EjercicioProgramado[];
};

export type EstadoSesion = "programada" | "completada" | "cancelada";

export type Sesion = {
  id: string;
  atletaId: string;
  fecha: string; // ISO yyyy-mm-dd
  dia: DiaSemana; // derivado de `fecha` en semilla; se mantiene por compatibilidad con WeekStrip
  nombre: string;
  ejercicios: EjercicioProgramado[];
  estado: EstadoSesion;
  notas?: string;
  tipo?: string; // texto corto: "Gym", "Campo", "Readaptación"...
  rpeObjetivo?: number; // 0-10, admite medios (6.5) — intensidad se CALCULA de aquí, nunca se guarda
  /**
   * Sub-bloques v4 (ver `bloquesDeSesion()` en lib/store/sesiones.ts). Legado
   * `ejercicios` (plano) se mantiene para no romper las vistas actuales ni el
   * diálogo "Nueva sesión" (aún no migrado) — opcional a propósito: "si existe
   * y tiene contenido" es la fuente de verdad, si no, se envuelve `ejercicios`.
   */
  bloquesEjercicios?: BloqueEjercicios[];
};

export type BloqueSemanal = {
  id: string;
  atletaId: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  objetivo: string;
  sesionIds: string[];
  /** Del BLOCK OUTLINE del Excel: nº de semana post-operatoria en la que arranca el bloque. */
  semanaPostOpInicio?: number;
  /** Índices 0-based de semanas del bloque que son "semana de test". */
  semanasTest?: number[];
};

/** Forma "resuelta" de un bloque con sus sesiones embebidas — la que consumen
 * `ProgramacionView`/`SesionAccordion` (compatibilidad con la v1). */
export type BloqueSemanalConSesiones = Omit<BloqueSemanal, "sesionIds"> & {
  sesiones: Sesion[];
};

// ---------------------------------------------------------------------------
// Catálogo de tests
// ---------------------------------------------------------------------------

export type TipoTest = "unilateral-lsi" | "valor-unico" | "cuestionario-pro";

export type VariableDef = {
  id: string;
  nombre: string;
  unidad: string;
};

export type TestDef = {
  id: string;
  nombre: string;
  variables: VariableDef[];
  tipo: TipoTest;
};

export type ValorUnilateral = Record<string, { izq: number; der: number }>;
export type ValorUnico = Record<string, number>;
export type ValorCuestionario = { puntuacion: number };

export type RegistroTest = {
  id: string;
  atletaId: string;
  testId: string;
  fecha: string;
  valores: ValorUnilateral | ValorUnico | ValorCuestionario;
};

// ---------------------------------------------------------------------------
// Plantillas
// ---------------------------------------------------------------------------

export type PlantillaSesion = {
  id: string;
  nombre: string;
  objetivo: string;
  categoria: Categoria;
  ejercicios: EjercicioProgramado[];
};

export type PlantillaPrograma = {
  id: string;
  nombre: string;
  descripcion: string;
  semanas: { sesiones: Omit<Sesion, "id" | "fecha" | "atletaId">[] }[];
};

// ---------------------------------------------------------------------------
// Formularios
// ---------------------------------------------------------------------------

export type TipoCampoFormulario = "escala-0-10" | "numero" | "texto" | "seleccion";

export type VariableDestino = "dolor" | "rpe" | "carga" | null;

export type CampoFormulario = {
  id: string;
  etiqueta: string;
  tipo: TipoCampoFormulario;
  opciones?: string[];
  variableDestino?: VariableDestino;
};

export type FormularioDef = {
  id: string;
  nombre: string;
  descripcion: string;
  campos: CampoFormulario[];
  /** Si está presente, responder este formulario genera un RegistroTest de este test. */
  testDefId?: string;
};

export type EstadoEnvioFormulario = "pendiente" | "respondido";

export type FormularioEnvio = {
  id: string;
  formularioId: string;
  atletaId: string;
  fechaEnvio: string;
  estado: EstadoEnvioFormulario;
  respuestas?: Record<string, string | number>;
  fechaRespuesta?: string;
};

// ---------------------------------------------------------------------------
// Notas de calendario (clínica)
// ---------------------------------------------------------------------------

export type NotaCalendario = {
  id: string;
  fecha: string; // ISO yyyy-mm-dd
  texto: string;
  atletaId?: string; // opcional: nota ligada a un atleta ("Marcos de vacaciones")
};

// ---------------------------------------------------------------------------
// Notificaciones
// ---------------------------------------------------------------------------

export type TipoNotificacion = "alerta" | "recordatorio" | "tarea";

/** Misma escala que `SeveridadHallazgo` (lib/insights), duplicada aquí para no
 * acoplar el store al motor de hallazgos — ver lib/notificaciones/desde-hallazgos.ts. */
export type SeveridadNotificacion = "info" | "atencion" | "critico";

export type Notificacion = {
  id: string;
  atletaId?: string;
  tipo: TipoNotificacion;
  titulo: string;
  detalle: string;
  fecha: string;
  leida: boolean;
  completada: boolean;
  enlace: string;
  /** Solo presente en notificaciones materializadas desde un hallazgo vivo. */
  severidad?: SeveridadNotificacion;
};

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export type Tema = "fisiofles" | "clasico-excel" | "oscuro";

export type UmbralesConfig = {
  acwrBajo: number;
  acwrAlto: number;
  simetriaObjetivo: number;
  simetriaAceptable: number;
  dolorAlerta: number;
  /** Umbrales de `intensidadSesion()` (lib/calculations/intensidad.ts). */
  rpeLow: number;
  rpeHigh: number;
};

export type VistaAtletas = "grid" | "lista";

/** Cabecera del informe (FASE 7). Datos ficticios editables como el resto de config. */
export type PerfilProfesional = {
  nombre: string;
  rol: string;
  numColegiado: string;
  clinica: string;
};

/** Ids de métrica válidos para `Config["fichaMetricas"]` (FASE 4). */
export type MetricaFicha =
  | "readiness"
  | "dolor"
  | "carga-semanal"
  | "acwr"
  | "simetria"
  | "adherencia"
  | "semana-proceso"
  | "proxima-sesion";

export type Config = {
  tema: Tema;
  /** Paleta cerrada de 6 acentos — ver lib/personalizacion/acentos.ts. No es un color libre. */
  acento: AcentoId;
  umbrales: UmbralesConfig;
  vistaAtletas: VistaAtletas;
  perfilProfesional: PerfilProfesional;
  /** Ids de `MetricaFicha` — métricas visibles del header de la ficha, por defecto 5 (ver FASE 4). */
  fichaMetricas: string[];
  /**
   * Gráficos visibles del dashboard v3. Ids `test:<testId>` (uno por test del
   * catálogo) y `resultado:<id>` para los derivados — ver lib/dashboard/graficos.ts.
   */
  dashboardGraficos: string[];
  /** Orden de render de los gráficos del dashboard v3. */
  dashboardGraficosOrden: string[];
  /**
   * Gráficos visibles del tab Datos de la ficha de atleta — MISMO catálogo
   * que `dashboardGraficos` (`lib/dashboard/graficos.ts`), config propia
   * porque la selección tiene sentido distinto por atleta (ver FASE 7).
   */
  fichaGraficos: string[];
  /** Orden de render de los gráficos de la ficha de atleta. */
  fichaGraficosOrden: string[];
};

// ---------------------------------------------------------------------------
// Estado global
// ---------------------------------------------------------------------------

export type AppState = {
  atletas: Atleta[];
  entrenadores: Entrenador[];
  tiposLesion: TipoLesion[];
  sesiones: Sesion[];
  bloques: BloqueSemanal[];
  ejercicios: import("@/lib/mock/ejercicios").Ejercicio[];
  catalogoTests: TestDef[];
  registrosTests: RegistroTest[];
  plantillasSesion: PlantillaSesion[];
  plantillasPrograma: PlantillaPrograma[];
  formulariosDef: FormularioDef[];
  formulariosEnvios: FormularioEnvio[];
  notificaciones: Notificacion[];
  notasCalendario: NotaCalendario[];
  config: Config;
};
