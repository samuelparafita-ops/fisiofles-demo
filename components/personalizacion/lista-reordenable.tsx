"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

export type ItemReordenable = { id: string; label: string; descripcion: string };

/**
 * Visibilidad + orden de una lista de paneles/métricas — botones subir/bajar
 * en vez de drag-and-drop (no hay librería de dnd en el proyecto, y el propio
 * encargo de Personalización lo ofrece como alternativa válida). Genérico:
 * lo usan tanto los 4 gráficos de la ficha de atleta
 * (`config.metricasVisiblesDashboard`/`ordenDashboard`) como las 5 métricas
 * de /dashboard (`config.dashboardMetricas`/`dashboardOrden`).
 */
export function ListaReordenable({
  catalogo,
  visibles,
  orden,
  onChange,
}: {
  catalogo: ItemReordenable[];
  visibles: string[];
  orden: string[];
  onChange: (next: { visibles: string[]; orden: string[] }) => void;
}) {
  const base = orden.length > 0 ? orden : catalogo.map((c) => c.id);
  const idsOrdenados = [...base, ...catalogo.map((c) => c.id).filter((id) => !base.includes(id))];

  function toggle(id: string) {
    const next = visibles.includes(id) ? visibles.filter((v) => v !== id) : [...visibles, id];
    onChange({ visibles: next, orden: idsOrdenados });
  }

  function mover(id: string, dir: -1 | 1) {
    const idx = idsOrdenados.indexOf(id);
    const destino = idx + dir;
    if (destino < 0 || destino >= idsOrdenados.length) return;
    const next = [...idsOrdenados];
    [next[idx], next[destino]] = [next[destino], next[idx]];
    onChange({ visibles, orden: next });
  }

  return (
    <div className="divide-y divide-borderSoft">
      {idsOrdenados.map((id, i) => {
        const def = catalogo.find((c) => c.id === id);
        if (!def) return null;
        const activo = visibles.includes(id);
        return (
          <div key={id} className="flex items-center gap-3 py-2.5">
            <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={activo}
                onChange={() => toggle(id)}
                className="mt-0.5 size-4 shrink-0 accent-brand"
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-textStrong">{def.label}</span>
                <span className="block text-xs text-textDim">{def.descripcion}</span>
              </span>
            </label>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                disabled={i === 0}
                onClick={() => mover(id, -1)}
                aria-label={`Subir ${def.label}`}
                className="rounded-md border border-borderSoft p-1.5 text-textDim transition-colors hover:border-brand/50 hover:text-textStrong disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronUp className="size-3.5" />
              </button>
              <button
                type="button"
                disabled={i === idsOrdenados.length - 1}
                onClick={() => mover(id, 1)}
                aria-label={`Bajar ${def.label}`}
                className="rounded-md border border-borderSoft p-1.5 text-textDim transition-colors hover:border-brand/50 hover:text-textStrong disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronDown className="size-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
