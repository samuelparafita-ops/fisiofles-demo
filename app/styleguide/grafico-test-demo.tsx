"use client";

import { useMemo } from "react";
import { GraficoTest } from "@/components/charts";
import { catalogoGraficos, graficoResultadoId, graficoTestId } from "@/lib/dashboard/graficos";
import { rangoDesdeSemanas } from "@/lib/dashboard/series-tests";
import { useAtletas, useCatalogoTests, useConfig, useRegistrosTests } from "@/lib/store";

/**
 * Verificación visual temporal de la FASE 3 (motor de gráficos por test):
 * CMJ y Nordic (origen "test", barras) + cuadrante F-V (origen "resultado",
 * dispersión), montados con datos reales del store. Borrar cuando el
 * dashboard v3 (FASE 4) los reemplace en su ubicación definitiva.
 */
export function GraficoTestDemo() {
  const atletas = useAtletas();
  const catalogo = useCatalogoTests();
  const registros = useRegistrosTests();
  const { umbrales } = useConfig();

  const graficos = useMemo(() => catalogoGraficos(catalogo), [catalogo]);
  const { desde, hasta } = useMemo(() => rangoDesdeSemanas(12), []);

  const cmj = graficos.find((g) => g.id === graficoTestId("cmj"));
  const nordic = graficos.find((g) => g.id === graficoTestId("nordic"));
  const cuadranteFv = graficos.find((g) => g.id === graficoResultadoId("cuadrante-fv"));

  const activos = atletas.filter((a) => a.estado === "activo");
  const seleccionados = activos.slice(0, 2).map((a) => a.id);

  const propsComunes = { registros, catalogo, atletas: activos, atletasSeleccionados: seleccionados, umbrales, desde, hasta };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      {cmj && <GraficoTest def={cmj} {...propsComunes} />}
      {nordic && <GraficoTest def={nordic} {...propsComunes} />}
      {cuadranteFv && <GraficoTest def={cuadranteFv} {...propsComunes} className="xl:col-span-2" />}
    </div>
  );
}
