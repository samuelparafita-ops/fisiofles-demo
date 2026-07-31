/**
 * Genera las sesiones y bloques semanales resultantes de aplicar una
 * PlantillaPrograma o PlantillaSesion a un atleta desde una fecha de
 * inicio. Funciones puras (no despachan): las usa tanto el diálogo de la
 * ficha de atleta (`AplicarPlantillaDialog`) como la página /plantillas
 * (`AplicarAAtletaDialog`) para no duplicar esta lógica — ver CLAUDE.md >
 * única fuente de verdad.
 */

import { DIAS_SEMANA } from "./types";
import type {
  BloqueEjercicios,
  BloqueSemanal,
  EjercicioProgramado,
  PlantillaPrograma,
  PlantillaSesion,
  Sesion,
} from "./types";

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

const NOMBRES_DIA: readonly Sesion["dia"][] = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

function diaSemanaDeIso(fechaIso: string): Sesion["dia"] {
  const d = new Date(`${fechaIso}T00:00:00`);
  return NOMBRES_DIA[d.getDay()];
}

let contadorId = 0;
function nuevoId(prefijo: string): string {
  contadorId += 1;
  return `${prefijo}-${Date.now().toString(36)}-${contadorId}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Envuelve un array plano de ejercicios en el único sub-bloque "Principal"
 *  (formato v4). Las plantillas son planas por diseño (ver `PlantillaSesion`),
 *  así que al materializarlas hay que escribir TAMBIÉN `bloquesEjercicios`
 *  para que la sesión nazca en formato v4, igual que hacen los diálogos de
 *  creación/edición de sesión. */
function bloquePrincipal(ejercicios: EjercicioProgramado[]): BloqueEjercicios[] {
  return [{ id: nuevoId("bloque-ej"), nombre: "Principal", ejercicios }];
}

export type ResultadoAplicarPlantilla = { sesiones: Sesion[]; bloques: BloqueSemanal[] };

export function generarDesdePrograma(
  plantilla: PlantillaPrograma,
  atletaId: string,
  fechaInicio: string
): ResultadoAplicarPlantilla {
  const sesiones: Sesion[] = [];
  const bloques: BloqueSemanal[] = [];
  const inicio = new Date(`${fechaInicio}T00:00:00`);

  plantilla.semanas.forEach((semana, semanaIdx) => {
    const inicioSemana = addDias(inicio, semanaIdx * 7);
    const finSemana = addDias(inicioSemana, 6);
    const sesionesCreadas: Sesion[] = semana.sesiones.map((s) => {
      const offsetDia = DIAS_SEMANA.indexOf(s.dia);
      const fecha = toIso(addDias(inicioSemana, offsetDia));
      return {
        id: nuevoId("ses"),
        atletaId,
        fecha,
        dia: s.dia,
        nombre: s.nombre,
        ejercicios: s.ejercicios,
        bloquesEjercicios: bloquePrincipal(s.ejercicios),
        estado: s.estado,
        notas: s.notas,
      };
    });
    sesiones.push(...sesionesCreadas);

    bloques.push({
      id: nuevoId("bloque"),
      atletaId,
      nombre: `${plantilla.nombre} · Semana ${semanaIdx + 1}`,
      fechaInicio: toIso(inicioSemana),
      fechaFin: toIso(finSemana),
      objetivo: plantilla.descripcion,
      sesionIds: sesionesCreadas.map((s) => s.id),
    });
  });

  return { sesiones, bloques };
}

export function generarDesdeSesion(
  plantilla: PlantillaSesion,
  atletaId: string,
  fechaInicio: string
): ResultadoAplicarPlantilla {
  const nuevaSesion: Sesion = {
    id: nuevoId("ses"),
    atletaId,
    fecha: fechaInicio,
    dia: diaSemanaDeIso(fechaInicio),
    nombre: plantilla.nombre,
    ejercicios: plantilla.ejercicios,
    bloquesEjercicios: bloquePrincipal(plantilla.ejercicios),
    estado: "programada",
  };

  const bloque: BloqueSemanal = {
    id: nuevoId("bloque"),
    atletaId,
    nombre: plantilla.nombre,
    fechaInicio,
    fechaFin: fechaInicio,
    objetivo: plantilla.objetivo,
    sesionIds: [nuevaSesion.id],
  };

  return { sesiones: [nuevaSesion], bloques: [bloque] };
}
