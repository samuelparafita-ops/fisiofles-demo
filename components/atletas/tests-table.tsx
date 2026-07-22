"use client";

import { useMemo, useState } from "react";
import {
  simetria,
  estadoSimetria,
  type EstadoSimetria,
  type UmbralesSimetria,
} from "@/lib/calculations";
import { colors } from "@/lib/tokens";
import type {
  RegistroTest,
  TestDef,
  ValorCuestionario,
  ValorUnico,
  ValorUnilateral,
} from "@/lib/store";

const UMBRALES_DEFECTO: UmbralesSimetria = { aceptable: 85, optimo: 90 };

const ESTADO_LABEL: Record<EstadoSimetria, string> = {
  deficit: "Déficit",
  aceptable: "Aceptable",
  optimo: "Óptimo",
};

const ESTADO_COLOR: Record<EstadoSimetria, string> = {
  deficit: colors.state.bad,
  aceptable: colors.state.warn,
  optimo: colors.state.good,
};

const selectClass =
  "flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

function fmtFecha(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function fmtValor(n: number) {
  return Math.abs(n) < 10 ? n.toFixed(2) : n.toFixed(1);
}

type FilaFormateada = { texto: string; lsi?: { pct: number; estado: EstadoSimetria } };

/** Formatea los `valores` de un registro según el tipo de su test — misma
 * lógica que `regUnilateral`/`regValorUnico`/`regCuestionario` de la
 * semilla, pero operando sobre cualquier `TestDef` del catálogo dinámico. */
function formatearValores(
  test: TestDef,
  valores: RegistroTest["valores"],
  umbrales: UmbralesSimetria
): FilaFormateada[] {
  if (test.tipo === "cuestionario-pro") {
    const v = valores as ValorCuestionario;
    return [{ texto: `Puntuación: ${v.puntuacion}` }];
  }

  if (test.tipo === "unilateral-lsi") {
    const v = valores as ValorUnilateral;
    const variablesBase = test.variables.filter((va) => !(va.nombre === "LSI" && va.unidad === "%"));
    return variablesBase.map((variable) => {
      const val = v[variable.id];
      if (!val) return { texto: `${variable.nombre}: —` };
      const pct = simetria(val.izq, val.der);
      return {
        texto: `${variable.nombre}: Izq ${fmtValor(val.izq)} · Der ${fmtValor(val.der)} ${variable.unidad}`.trim(),
        lsi: { pct, estado: estadoSimetria(pct, umbrales) },
      };
    });
  }

  const v = valores as ValorUnico;
  return test.variables.map((variable) => ({
    texto: `${variable.nombre}: ${v[variable.id] !== undefined ? fmtValor(v[variable.id]) : "—"} ${variable.unidad}`.trim(),
  }));
}

/**
 * TestsTable v2 — agrupada por test del catálogo (no solo simetrías), cada
 * fila un registro con fecha y sus valores según el tipo del test.
 */
export function TestsTable({
  registros,
  catalogo,
  umbrales = UMBRALES_DEFECTO,
}: {
  registros: RegistroTest[];
  catalogo: TestDef[];
  umbrales?: UmbralesSimetria;
}) {
  const [filtro, setFiltro] = useState("todos");

  const testsConRegistros = useMemo(() => {
    const ids = Array.from(new Set(registros.map((r) => r.testId)));
    return ids
      .map((id) => catalogo.find((t) => t.id === id))
      .filter((t): t is TestDef => Boolean(t))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [registros, catalogo]);

  const grupos = useMemo(() => {
    const filtrados =
      filtro === "todos" ? testsConRegistros : testsConRegistros.filter((t) => t.id === filtro);
    return filtrados.map((test) => ({
      test,
      registros: registros
        .filter((r) => r.testId === test.id)
        .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    }));
  }, [testsConRegistros, registros, filtro]);

  if (testsConRegistros.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-10 text-center text-sm text-textDim">
        Sin tests registrados todavía.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className={selectClass}>
        <option value="todos">Todos los tests</option>
        {testsConRegistros.map((t) => (
          <option key={t.id} value={t.id}>
            {t.nombre}
          </option>
        ))}
      </select>

      {grupos.map(({ test, registros: regs }) => (
        <div key={test.id} className="overflow-hidden rounded-xl border border-borderSoft bg-surface2 shadow-sm">
          <div className="border-b border-borderSoft bg-bg px-4 py-3">
            <p className="font-display text-sm font-bold text-textStrong">{test.nombre}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-borderSoft text-left text-xs uppercase tracking-wide text-textDim">
                  <th className="px-4 py-2.5 font-medium">Fecha</th>
                  <th className="px-4 py-2.5 font-medium">Valores</th>
                </tr>
              </thead>
              <tbody>
                {regs.map((r) => {
                  const filas = formatearValores(test, r.valores, umbrales);
                  return (
                    <tr key={r.id} className="border-b border-borderSoft align-top last:border-0">
                      <td className="whitespace-nowrap px-4 py-3 text-textDim">{fmtFecha(r.fecha)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1.5">
                          {filas.map((f, i) => (
                            <div key={i} className="flex flex-wrap items-center gap-2">
                              <span className="text-text">{f.texto}</span>
                              {f.lsi && (
                                <span
                                  className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                                  style={{
                                    color: ESTADO_COLOR[f.lsi.estado],
                                    background: `${ESTADO_COLOR[f.lsi.estado]}1A`,
                                  }}
                                >
                                  LSI {f.lsi.pct.toFixed(0)}% · {ESTADO_LABEL[f.lsi.estado]}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
