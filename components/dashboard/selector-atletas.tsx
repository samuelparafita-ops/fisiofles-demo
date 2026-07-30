"use client";

import { useState } from "react";
import { ChevronDown, Search, Users, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { colorSemaforo, colorSemaforoTexto } from "@/lib/calculations";
import { resolverFaseDeAtleta, type Atleta, type TipoLesion } from "@/lib/store";

const AVISO_LEGIBILIDAD_DESDE = 8;

/**
 * Multi-selector de atletas a superponer en los gráficos de /dashboard. Sin
 * tope de selección (FASE 3) — con muchos atletas los colores dejan de ser
 * únicos por índice de la paleta base y pasan a generarse por rotación HSL
 * (ver `useComparisonColorsExtended` en `lib/theme.ts`), pero siguen siendo
 * deterministas. `seleccionados` es un array de ids EN ORDEN DE SELECCIÓN —
 * ese orden es el que asigna el color (colores[i] para seleccionados[i]),
 * igual en todos los gráficos de la página. No persiste entre sesiones (es
 * una comparación puntual, no config de la app).
 */
export function SelectorAtletas({
  atletas,
  tiposLesion,
  seleccionados,
  onChange,
  colores,
}: {
  atletas: Atleta[];
  tiposLesion: TipoLesion[];
  seleccionados: string[];
  onChange: (next: string[]) => void;
  colores: string[];
}) {
  const [busqueda, setBusqueda] = useState("");

  const filtrados = atletas.filter((a) =>
    a.nombre.toLowerCase().includes(busqueda.trim().toLowerCase())
  );

  function toggle(id: string) {
    onChange(seleccionados.includes(id) ? seleccionados.filter((s) => s !== id) : [...seleccionados, id]);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-borderSoft bg-surface2 px-3 py-2 text-sm font-medium text-textStrong shadow-sm transition-colors hover:border-brand/50"
          >
            <Users className="size-4 text-textDim" />
            Comparar atletas
            {seleccionados.length > 0 && (
              <span className="rounded-full bg-brand-tint px-1.5 py-0.5 text-[11px] font-semibold text-brand-ink">
                {seleccionados.length}
              </span>
            )}
            <ChevronDown className="size-3.5 text-textDim" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-textDim" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar atleta..."
              className="flex h-9 w-full rounded-md border border-input bg-transparent pl-8 pr-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="mt-2 max-h-64 space-y-0.5 overflow-y-auto">
            {filtrados.length === 0 ? (
              <p className="px-2 py-3 text-center text-sm text-textDim">Sin resultados.</p>
            ) : (
              filtrados.map((a) => {
                const idx = seleccionados.indexOf(a.id);
                const activo = idx >= 0;
                const faseDe = resolverFaseDeAtleta(a, tiposLesion);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggle(a.id)}
                    className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-bg"
                  >
                    <input type="checkbox" checked={activo} readOnly className="size-4 shrink-0 accent-brand" />
                    {activo && (
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ background: colores[idx] }}
                        aria-hidden
                      />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-textStrong">{a.nombre}</span>
                      <span className="mt-0.5 flex items-center gap-1.5">
                        <span className="truncate text-xs text-textDim">{a.deporte}</span>
                        {faseDe && (
                          <span
                            className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                            style={{
                              background: `${colorSemaforo(faseDe.indiceFase, faseDe.totalFases)}1A`,
                              color: colorSemaforoTexto(faseDe.indiceFase, faseDe.totalFases),
                            }}
                          >
                            {faseDe.fase.nombre}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>

      {seleccionados.length >= AVISO_LEGIBILIDAD_DESDE && (
        <span className="text-xs text-textDim">Con muchos atletas superpuestos el gráfico pierde legibilidad.</span>
      )}

      {seleccionados.map((id, idx) => {
        const atleta = atletas.find((a) => a.id === id);
        if (!atleta) return null;
        const color = colores[idx];
        return (
          <span
            key={id}
            className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
            style={{ borderColor: color, color, background: `${color}14` }}
          >
            <span className="size-2 shrink-0 rounded-full" style={{ background: color }} aria-hidden />
            {atleta.nombre}
            <button
              type="button"
              onClick={() => toggle(id)}
              aria-label={`Quitar ${atleta.nombre} de la comparación`}
              className="rounded-full transition-opacity hover:opacity-70"
            >
              <X className="size-3" />
            </button>
          </span>
        );
      })}
    </div>
  );
}
