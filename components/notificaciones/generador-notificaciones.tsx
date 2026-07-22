"use client";

import { useEffect, useRef } from "react";
import { generarHallazgos } from "@/lib/insights";
import { notificacionDesdeHallazgo } from "@/lib/notificaciones/desde-hallazgos";
import {
  accionCrear,
  useAtletas,
  useCatalogoTests,
  useConfig,
  useDispatch,
  useFormulariosEnvios,
  useNotificaciones,
  useRegistrosTests,
  useSesiones,
} from "@/lib/store";

/**
 * Materializa los hallazgos vivos de `lib/insights` como notificaciones
 * persistidas del store, con dedupe por id de hallazgo (regla+atleta) +
 * fecha para no duplicar en cada render. Sin salida visual — se monta una
 * vez en el layout de la app.
 */
export function GeneradorNotificaciones() {
  const atletas = useAtletas();
  const sesiones = useSesiones();
  const registrosTests = useRegistrosTests();
  const catalogoTests = useCatalogoTests();
  const formulariosEnvios = useFormulariosEnvios();
  const config = useConfig();
  const notificaciones = useNotificaciones();
  const dispatch = useDispatch();

  // Ref para leer las notificaciones actuales sin que el efecto dependa de
  // ellas (si dependiera, cada CREAR que dispara re-ejecutaría el cálculo).
  const notificacionesRef = useRef(notificaciones);
  notificacionesRef.current = notificaciones;

  // Guarda los ids ya despachados en esta instancia del componente. Necesario
  // porque en desarrollo (Strict Mode) React invoca el efecto dos veces
  // seguidas antes de que el primer CREAR se refleje en `notificaciones`: sin
  // este guard, ambas pasadas verían el mismo hueco y crearían la misma
  // notificación dos veces (id duplicado).
  const idsDespachadosRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const hallazgos = generarHallazgos({
      atletas,
      sesiones,
      registrosTests,
      catalogoTests,
      formulariosEnvios,
      config,
    });

    const existentes = new Set(notificacionesRef.current.map((n) => n.id));
    for (const hallazgo of hallazgos) {
      const notificacion = notificacionDesdeHallazgo(hallazgo);
      if (existentes.has(notificacion.id) || idsDespachadosRef.current.has(notificacion.id)) continue;
      idsDespachadosRef.current.add(notificacion.id);
      dispatch(accionCrear("notificaciones", notificacion));
    }
  }, [atletas, sesiones, registrosTests, catalogoTests, formulariosEnvios, config, dispatch]);

  return null;
}
