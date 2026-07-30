import type { BloqueEjercicios, Sesion } from "./types";

/**
 * Sub-bloques de una sesión — si la sesión ya trae `bloquesEjercicios` (v4)
 * y tiene contenido, los devuelve tal cual; si no, envuelve el `ejercicios`
 * plano (legado) en un único bloque "Principal". Las vistas actuales siguen
 * leyendo `ejercicios` directamente; este helper es para la migración de
 * FASE 5 en adelante.
 */
export function bloquesDeSesion(sesion: Sesion): BloqueEjercicios[] {
  if (sesion.bloquesEjercicios && sesion.bloquesEjercicios.length > 0) {
    return sesion.bloquesEjercicios;
  }
  return [{ id: `${sesion.id}-principal`, nombre: "Principal", ejercicios: sesion.ejercicios }];
}
