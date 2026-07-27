"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { catalogoGraficos, type GraficoDef } from "@/lib/dashboard/graficos";
import { useCatalogoTests, useConfig, useDispatch } from "@/lib/store";

/**
 * Checkboxes de gráficos visibles en /dashboard — persiste en
 * `config.dashboardGraficos` (sobrevive al refresh). El orden de render lo
 * decide `config.dashboardGraficosOrden` (Personalización), no este selector
 * — ver `lib/dashboard/graficos.ts`.
 */
export function SelectorGraficos() {
  const catalogoTests = useCatalogoTests();
  const { dashboardGraficos } = useConfig();
  const dispatch = useDispatch();
  const [busqueda, setBusqueda] = useState("");

  const graficos = useMemo(() => catalogoGraficos(catalogoTests), [catalogoTests]);
  const resultados = useMemo(() => graficos.filter((g) => g.origen === "resultado"), [graficos]);
  const tests = useMemo(() => graficos.filter((g) => g.origen === "test"), [graficos]);

  function toggle(id: string) {
    const next = dashboardGraficos.includes(id)
      ? dashboardGraficos.filter((g) => g !== id)
      : [...dashboardGraficos, id];
    dispatch({ type: "CONFIG_ACTUALIZAR", payload: { dashboardGraficos: next } });
  }

  const q = busqueda.trim().toLowerCase();
  const filtrar = (lista: GraficoDef[]) => (q ? lista.filter((g) => g.titulo.toLowerCase().includes(q)) : lista);
  const resultadosFiltrados = filtrar(resultados);
  const testsFiltrados = filtrar(tests);

  function Item(g: GraficoDef) {
    const activo = dashboardGraficos.includes(g.id);
    return (
      <label
        key={g.id}
        className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-bg"
      >
        <input
          type="checkbox"
          checked={activo}
          onChange={() => toggle(g.id)}
          className="mt-0.5 size-4 shrink-0 accent-brand"
        />
        <span className="min-w-0 truncate text-sm font-medium text-textStrong">{g.titulo}</span>
      </label>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-borderSoft bg-surface2 px-3 py-2 text-sm font-medium text-textStrong shadow-sm transition-colors hover:border-brand/50"
        >
          <SlidersHorizontal className="size-4 text-textDim" />
          Gráficos
          <span className="rounded-full bg-brand-tint px-1.5 py-0.5 text-[11px] font-semibold text-brand-ink">
            {dashboardGraficos.length}/{graficos.length}
          </span>
          <ChevronDown className="size-3.5 text-textDim" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[34rem]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-textDim" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar gráfico..."
            className="flex h-9 w-full rounded-md border border-input bg-transparent pl-8 pr-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="mt-3 grid max-h-96 grid-cols-2 gap-x-4 overflow-y-auto">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-textDim">Resultados</p>
            <div className="space-y-0.5">
              {resultadosFiltrados.length === 0 ? (
                <p className="px-2 py-3 text-xs text-textDim">Sin resultados.</p>
              ) : (
                resultadosFiltrados.map(Item)
              )}
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-textDim">Tests</p>
            <div className="space-y-0.5">
              {testsFiltrados.length === 0 ? (
                <p className="px-2 py-3 text-xs text-textDim">Sin resultados.</p>
              ) : (
                testsFiltrados.map(Item)
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
