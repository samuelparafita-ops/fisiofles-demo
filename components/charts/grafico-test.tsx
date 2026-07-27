"use client";

import { useEffect, useState } from "react";
import { useChartGridColors, useComparisonColors } from "@/lib/theme";
import { UMBRALES_DEFECTO } from "@/lib/personalizacion/umbrales";
import type { GraficoDef } from "@/lib/dashboard/graficos";
import { serieTest, ultimoValorPorAtleta, puntosCuadranteFV } from "@/lib/dashboard/series-tests";
import type { Atleta, RegistroTest, TestDef, UmbralesConfig } from "@/lib/store/types";
import { BarrasComparativa } from "./barras-comparativa";
import { BarrasTemporal } from "./barras-temporal";
import { DispersionCuadrante } from "./dispersion-cuadrante";
import type { AtletaSerie } from "./multi-series-line";

export type GraficoTestProps = {
  def: GraficoDef;
  /** Todos los registros de test — cada componente hijo filtra por `def.testId` internamente. */
  registros: RegistroTest[];
  catalogo: TestDef[];
  /** Plantilla activa completa (el agregado se calcula sobre todos ellos). */
  atletas: Atleta[];
  /** Ids resaltados/superpuestos — hasta 6, ver `useComparisonColors()`. */
  atletasSeleccionados?: string[];
  /** Siempre `state.config.umbrales` en la app real (ver CLAUDE.md); por defecto solo para no romper llamadas sueltas. */
  umbrales?: UmbralesConfig;
  desde: Date;
  hasta: Date;
  className?: string;
};

type Modo = "comparativa" | "temporal";

function nombreDe(atletas: Atleta[], atletaId: string): string {
  return atletas.find((a) => a.id === atletaId)?.nombre ?? atletaId;
}

function ToggleModo({ modo, onChange }: { modo: Modo; onChange: (m: Modo) => void }) {
  const gridColors = useChartGridColors();
  const OPCIONES: { valor: Modo; label: string }[] = [
    { valor: "comparativa", label: "Por atleta" },
    { valor: "temporal", label: "Evolución" },
  ];
  return (
    <div className="flex items-center gap-1">
      {OPCIONES.map((o) => {
        const activo = modo === o.valor;
        return (
          <button
            key={o.valor}
            type="button"
            onClick={() => onChange(o.valor)}
            className="rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors"
            style={{
              borderColor: activo ? gridColors.line : gridColors.grid,
              color: gridColors.axis,
              background: activo ? `${gridColors.line}1A` : "transparent",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function SelectVariable({
  variables,
  valor,
  onChange,
}: {
  variables: GraficoDef["variables"];
  valor: string;
  onChange: (id: string) => void;
}) {
  const gridColors = useChartGridColors();
  if (variables.length <= 1) return null;
  return (
    <select
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-full border px-2.5 py-1 text-[11px] font-medium focus-visible:outline-none"
      style={{ borderColor: gridColors.grid, color: gridColors.axis, background: "transparent" }}
    >
      {variables.map((v) => (
        <option key={v.id} value={v.id}>
          {v.nombre}
          {v.unidad ? ` (${v.unidad})` : ""}
        </option>
      ))}
    </select>
  );
}

function GraficoTestDispersion({
  def,
  registros,
  catalogo,
  atletas,
  atletasSeleccionados = [],
  hasta,
  className,
}: GraficoTestProps) {
  const puntos = puntosCuadranteFV(registros, catalogo, atletas, hasta).map((p) => ({
    ...p,
    nombre: nombreDe(atletas, p.atletaId),
  }));

  return (
    <DispersionCuadrante
      titulo={def.titulo}
      descripcion={def.descripcion}
      puntos={puntos}
      ejeXLabel="IMTP · Fuerza relativa"
      ejeYLabel="Velocidad máxima · Vmax"
      unidadX=" N/kg"
      unidadY=" m/s"
      seleccionados={atletasSeleccionados}
      className={className}
    />
  );
}

function GraficoTestBarras({
  def,
  registros,
  catalogo,
  atletas,
  atletasSeleccionados = [],
  umbrales = UMBRALES_DEFECTO,
  desde,
  hasta,
  className,
}: GraficoTestProps) {
  const comparisonColors = useComparisonColors();
  const [variableId, setVariableId] = useState(def.variablePorDefecto);
  const [modo, setModo] = useState<Modo>("comparativa");

  // Si el GraficoDef cambia bajo la misma instancia (p. ej. reordenación en
  // Personalización), vuelve a la variable por defecto de ESE gráfico.
  useEffect(() => {
    setVariableId(def.variablePorDefecto);
  }, [def.id, def.variablePorDefecto]);

  const test = catalogo.find((t) => t.id === def.testId);
  const variable = test?.variables.find((v) => v.id === variableId);

  const accion = (
    <div className="flex flex-wrap items-center gap-2">
      <SelectVariable variables={def.variables} valor={variableId} onChange={setVariableId} />
      <ToggleModo modo={modo} onChange={setModo} />
    </div>
  );

  if (!test || !variable) return null;

  const esLsi = variable.nombre === "LSI" && variable.unidad === "%";
  const lineaReferenciaLsi = esLsi
    ? { valor: umbrales.simetriaObjetivo, etiqueta: `Objetivo ${umbrales.simetriaObjetivo}%` }
    : undefined;

  if (modo === "temporal") {
    const puntos = serieTest(registros, test, variableId, atletas, desde, hasta);
    const atletasSerie: AtletaSerie[] = atletasSeleccionados.map((id, idx) => ({
      id,
      nombre: nombreDe(atletas, id),
      color: comparisonColors[idx % comparisonColors.length],
    }));
    return (
      <BarrasTemporal
        titulo={def.titulo}
        descripcion={def.descripcion}
        puntos={puntos}
        atletas={atletasSerie}
        etiquetaAgregado="Media equipo"
        unidad={variable.unidad}
        lineaReferencia={lineaReferenciaLsi}
        action={accion}
        className={className}
      />
    );
  }

  const datos = ultimoValorPorAtleta(registros, test, variableId, atletas, hasta).map((d) => ({
    atletaId: d.atletaId,
    nombre: nombreDe(atletas, d.atletaId),
    valor: d.valor,
  }));

  return (
    <BarrasComparativa
      titulo={def.titulo}
      descripcion={def.descripcion}
      datos={datos}
      unidad={variable.unidad}
      seleccionados={atletasSeleccionados}
      lineaReferencia={lineaReferenciaLsi}
      action={accion}
      className={className}
    />
  );
}

/**
 * Orquestador del motor de gráficos por test (FASE 3): recibe un `GraficoDef`
 * (`lib/dashboard/graficos.ts`) y elige el componente de render adecuado.
 * `/dashboard` y la ficha del atleta reutilizarán este mismo componente sin
 * cambios (FASE 4) — ahí es donde se conecta a `state.config.umbrales` y al
 * selector de rango/atletas real.
 *
 * En esta fase soporta `origen: "test"` (siempre `tipo: "barras"`, con
 * desplegable de variable y toggle Por atleta/Evolución) y el resultado fijo
 * `resultado:cuadrante-fv` (`tipo: "dispersion"`). El resto de `resultado:*`
 * reutilizan sus propios componentes ya existentes (`AcwrChart`,
 * `SimetriaBar`, `MultiSeriesLine`) directamente desde la página.
 */
export function GraficoTest(props: GraficoTestProps) {
  if (props.def.tipo === "dispersion") return <GraficoTestDispersion {...props} />;
  return <GraficoTestBarras {...props} />;
}
