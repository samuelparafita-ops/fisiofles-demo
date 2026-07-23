/**
 * Modelo de datos v2 — única fuente de verdad para todo lo editable de la
 * demo. Vive en el store (`lib/store/`); `lib/mock/seed.ts` solo aporta los
 * valores iniciales. Ver CLAUDE.md > "Única fuente de verdad".
 */

import type { Capacidad, Sexo } from "@/lib/calculations";
import type { Categoria, Fase, VariableMedible } from "@/lib/mock/ejercicios";
import type { AcentoId } from "@/lib/personalizacion/acentos";

export type { Categoria, Fase, VariableMedible, Capacidad, Sexo };

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

export type Atleta = {
  id: string;
  nombre: string;
  deporte: string;
  lesion: string;
  lesionDetalle?: string;
  fase: string;
  semanaProceso: number;
  avatarInitials: string;
  sexo: Sexo;
  email?: string;
  telefono?: string;
  fechaNacimiento?: string;
  fechaInicioTratamiento?: string;
  estado: EstadoAtleta;
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
  evolucion: { fecha: string; dolor: number; carga: number; rpe: number }[];
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
};

export type BloqueSemanal = {
  id: string;
  atletaId: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  objetivo: string;
  sesionIds: string[];
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
};

export type VistaAtletas = "grid" | "lista";

export type Config = {
  tema: Tema;
  /** Paleta cerrada de 6 acentos — ver lib/personalizacion/acentos.ts. No es un color libre. */
  acento: AcentoId;
  umbrales: UmbralesConfig;
  /** Paneles visibles/orden del tab Datos de la ficha de atleta (perfil-fisico/acwr/simetrias/evolucion). */
  metricasVisiblesDashboard: string[];
  ordenDashboard: string[];
  vistaAtletas: VistaAtletas;
  /** Métricas visibles/orden de /dashboard (carga/acwr/simetria/dolor/sesiones) — ver lib/dashboard/metricas.ts. */
  dashboardMetricas: string[];
  dashboardOrden: string[];
};

// ---------------------------------------------------------------------------
// Estado global
// ---------------------------------------------------------------------------

export type AppState = {
  atletas: Atleta[];
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
  config: Config;
};
