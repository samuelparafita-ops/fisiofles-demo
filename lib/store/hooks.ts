"use client";

import { useMemo } from "react";
import { useStore } from "./store-provider";
import { simetriasDesdeRegistros } from "./simetrias";
import { simetria, cargaCronica, acwr, zonaAcwr, type ZonaAcwr } from "@/lib/calculations";
import type { Atleta, BloqueSemanalConSesiones, FaseLesion, TipoLesion } from "./types";

export function useAtletas() {
  return useStore().state.atletas;
}

export function useAtleta(id: string) {
  return useStore().state.atletas.find((a) => a.id === id);
}

export function useEntrenadores() {
  return useStore().state.entrenadores;
}

/** `undefined` tanto si el atleta no tiene entrenador asignado como si el id no existe. */
export function useEntrenador(id: string | undefined) {
  const { entrenadores } = useStore().state;
  return id ? entrenadores.find((e) => e.id === id) : undefined;
}

export function useTiposLesion() {
  return useStore().state.tiposLesion;
}

/** `undefined` tanto si no hay `id` como si no existe en el catálogo. */
export function useTipoLesion(id: string | undefined) {
  const { tiposLesion } = useStore().state;
  return id ? tiposLesion.find((t) => t.id === id) : undefined;
}

export type FaseDeAtleta = {
  tipoLesion: TipoLesion;
  fase: FaseLesion;
  indiceFase: number;
  totalFases: number;
};

/**
 * Versión pura de `useFaseDeAtleta` — para listas que resuelven la fase de
 * varios atletas en un `.map()` (no se puede llamar un hook ahí dentro).
 * `null` si falta `lesionId`/`faseId` o no resuelven contra el catálogo.
 */
export function resolverFaseDeAtleta(atleta: Atleta | undefined, tiposLesion: TipoLesion[]): FaseDeAtleta | null {
  if (!atleta) return null;
  const tipoLesion = tiposLesion.find((t) => t.id === atleta.lesionId);
  if (!tipoLesion) return null;
  const indiceFase = tipoLesion.fases.findIndex((f) => f.id === atleta.faseId);
  if (indiceFase === -1) return null;
  return { tipoLesion, fase: tipoLesion.fases[indiceFase], indiceFase, totalFases: tipoLesion.fases.length };
}

/** Resuelve `atleta.lesionId`/`faseId` contra el catálogo — `null` si falta cualquiera de los dos. */
export function useFaseDeAtleta(atleta: Atleta | undefined): FaseDeAtleta | null {
  const { tiposLesion } = useStore().state;
  return useMemo(() => resolverFaseDeAtleta(atleta, tiposLesion), [tiposLesion, atleta]);
}

/** Último readiness registrado (0–10) del atleta, o `null` si no tiene evolución. */
export function useReadinessActual(atletaId: string): number | null {
  const atleta = useAtleta(atletaId);
  const ultimo = atleta?.evolucion[atleta.evolucion.length - 1];
  return ultimo ? ultimo.readiness : null;
}

export function useEjercicios() {
  return useStore().state.ejercicios;
}

export function useEjercicio(id: string) {
  return useStore().state.ejercicios.find((e) => e.id === id);
}

export function useSesionesDeAtleta(atletaId: string) {
  const { sesiones } = useStore().state;
  return useMemo(
    () => sesiones.filter((s) => s.atletaId === atletaId),
    [sesiones, atletaId]
  );
}

export function useSesionesDelDia(fechaIso: string) {
  const { sesiones } = useStore().state;
  return useMemo(
    () => sesiones.filter((s) => s.fecha === fechaIso),
    [sesiones, fechaIso]
  );
}

export function useSesiones() {
  return useStore().state.sesiones;
}

export function useBloques() {
  return useStore().state.bloques;
}

/** Id del bloque sintético que agrupa las sesiones del atleta que no caen en ningún bloque real. */
export const BLOQUE_SUELTAS_SUFIJO = "-sesiones-sueltas";

/**
 * Bloques del atleta con sus sesiones ya resueltas (compat con
 * `ProgramacionView`). Una sesión pertenece a un bloque por `sesionIds` O por
 * FECHA (dentro de `fechaInicio`–`fechaFin`): los diálogos de creación
 * (`NuevaSesionDialog` desde la ficha o desde la parrilla de `/programacion`)
 * escriben en `sesiones`, no en `sesionIds`, así que sin la vía de la fecha una
 * sesión nueva salía en la parrilla y en el Calendario pero NUNCA en el tab
 * Programación. Las sesiones que no caen en ningún bloque se agrupan en un
 * bloque sintético al final para que ninguna quede invisible.
 */
export function useProgramacionDeAtleta(atletaId: string): BloqueSemanalConSesiones[] {
  const { bloques, sesiones } = useStore().state;
  return useMemo(() => {
    const delAtleta = sesiones.filter((s) => s.atletaId === atletaId);
    const porFecha = (a: { fecha: string }, b: { fecha: string }) => a.fecha.localeCompare(b.fecha);
    const asignadas = new Set<string>();

    const resueltos = bloques
      .filter((b) => b.atletaId === atletaId)
      .map((bloque) => {
        const { sesionIds, ...resto } = bloque;
        const propias = delAtleta
          .filter(
            (s) =>
              sesionIds.includes(s.id) || (s.fecha >= bloque.fechaInicio && s.fecha <= bloque.fechaFin)
          )
          .sort(porFecha);
        propias.forEach((s) => asignadas.add(s.id));
        return { ...resto, sesiones: propias };
      });

    const sueltas = delAtleta.filter((s) => !asignadas.has(s.id)).sort(porFecha);
    if (sueltas.length === 0) return resueltos;

    return [
      ...resueltos,
      {
        id: `${atletaId}${BLOQUE_SUELTAS_SUFIJO}`,
        atletaId,
        nombre: "Sesiones fuera de bloque",
        fechaInicio: sueltas[0].fecha,
        fechaFin: sueltas[sueltas.length - 1].fecha,
        objetivo: "Sesiones creadas fuera del rango de cualquier bloque semanal programado.",
        sesiones: sueltas,
      },
    ];
  }, [bloques, sesiones, atletaId]);
}

export function useCatalogoTests() {
  return useStore().state.catalogoTests;
}

export function useRegistrosTests() {
  return useStore().state.registrosTests;
}

export function useRegistrosDeAtleta(atletaId: string) {
  const { registrosTests } = useStore().state;
  return useMemo(
    () => registrosTests.filter((r) => r.atletaId === atletaId),
    [registrosTests, atletaId]
  );
}

export function usePlantillasSesion() {
  return useStore().state.plantillasSesion;
}

export function usePlantillasPrograma() {
  return useStore().state.plantillasPrograma;
}

export function useFormulariosDef() {
  return useStore().state.formulariosDef;
}

export function useFormulariosEnviosDeAtleta(atletaId: string) {
  const { formulariosEnvios } = useStore().state;
  return useMemo(
    () => formulariosEnvios.filter((f) => f.atletaId === atletaId),
    [formulariosEnvios, atletaId]
  );
}

export function useFormulariosEnvios() {
  return useStore().state.formulariosEnvios;
}

export function useNotificaciones() {
  return useStore().state.notificaciones;
}

export function useNotasCalendario() {
  return useStore().state.notasCalendario;
}

export function useNotificacionesNoLeidas() {
  const { notificaciones } = useStore().state;
  return useMemo(() => notificaciones.filter((n) => !n.leida), [notificaciones]);
}

export type ResumenAtleta = {
  simetriaMedia: number | null;
  ratioAcwr: number | null;
  zonaAcwr: ZonaAcwr | null;
  dolorActual: number | undefined;
};

/**
 * Resumen calculado (simetría media, ACWR actual, dolor último) — mismo
 * cálculo que antes vivía duplicado en `AtletaCard` y en la ficha; ahora lo
 * comparten también la vista de lista y las StatCards de la ficha.
 */
export function useResumenAtleta(atletaId: string): ResumenAtleta | null {
  const atleta = useAtleta(atletaId);
  const registros = useRegistrosDeAtleta(atletaId);
  const catalogo = useCatalogoTests();
  const { umbrales } = useConfig();

  return useMemo(() => {
    if (!atleta) return null;

    const simetrias = simetriasDesdeRegistros(registros, catalogo);
    const pcts = simetrias.map((s) => simetria(s.izq, s.der));
    const simetriaMedia = pcts.length > 0 ? pcts.reduce((a, b) => a + b, 0) / pcts.length : null;

    const agudos = atleta.acwr.map((c) => c.agudo);
    const ultimoIdx = agudos.length - 1;
    const cronica = ultimoIdx >= 0 ? cargaCronica(agudos, ultimoIdx) : null;
    const ratioAcwr = ultimoIdx >= 0 ? acwr(agudos[ultimoIdx], cronica) : null;
    const zona =
      ratioAcwr !== null ? zonaAcwr(ratioAcwr, { bajo: umbrales.acwrBajo, alto: umbrales.acwrAlto }) : null;

    const dolorActual = atleta.evolucion[atleta.evolucion.length - 1]?.dolor;

    return { simetriaMedia, ratioAcwr, zonaAcwr: zona, dolorActual };
  }, [atleta, registros, catalogo, umbrales]);
}

export function useConfig() {
  return useStore().state.config;
}

export function useDispatch() {
  return useStore().dispatch;
}
