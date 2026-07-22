"use client";

import { useMemo } from "react";
import { useStore } from "./store-provider";
import type { BloqueSemanalConSesiones } from "./types";

export function useAtletas() {
  return useStore().state.atletas;
}

export function useAtleta(id: string) {
  return useStore().state.atletas.find((a) => a.id === id);
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

/** Bloques del atleta con sus sesiones ya resueltas (compat con `ProgramacionView`). */
export function useProgramacionDeAtleta(atletaId: string): BloqueSemanalConSesiones[] {
  const { bloques, sesiones } = useStore().state;
  return useMemo(() => {
    return bloques
      .filter((b) => b.atletaId === atletaId)
      .map((bloque) => {
        const { sesionIds, ...resto } = bloque;
        return {
          ...resto,
          sesiones: sesionIds
            .map((id) => sesiones.find((s) => s.id === id))
            .filter((s): s is NonNullable<typeof s> => Boolean(s)),
        };
      });
  }, [bloques, sesiones, atletaId]);
}

export function useCatalogoTests() {
  return useStore().state.catalogoTests;
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

export function useNotificaciones() {
  return useStore().state.notificaciones;
}

export function useNotificacionesNoLeidas() {
  const { notificaciones } = useStore().state;
  return useMemo(() => notificaciones.filter((n) => !n.leida), [notificaciones]);
}

export function useConfig() {
  return useStore().state.config;
}

export function useDispatch() {
  return useStore().dispatch;
}
