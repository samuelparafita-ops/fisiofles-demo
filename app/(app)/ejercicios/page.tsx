"use client";

import { useMemo, useState } from "react";
import { Dumbbell } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { EjercicioCard } from "@/components/ejercicios/ejercicio-card";
import { NuevoEjercicioDialog } from "@/components/ejercicios/nuevo-ejercicio-dialog";
import { CATEGORIAS, FASES, ejercicios, type Categoria, type Fase } from "@/lib/mock/ejercicios";

const selectClass =
  "flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export default function EjerciciosPage() {
  const [categoria, setCategoria] = useState<Categoria | "Todas">("Todas");
  const [fase, setFase] = useState<Fase | "Todas">("Todas");

  const filtrados = useMemo(() => {
    return ejercicios.filter((e) => {
      const matchCategoria = categoria === "Todas" || e.categoria === categoria;
      const matchFase = fase === "Todas" || e.fasesSugeridas.includes(fase);
      return matchCategoria && matchFase;
    });
  }, [categoria, fase]);

  return (
    <>
      <PageHeader
        title="Ejercicios"
        description="Librería de ejercicios para planes de readaptación."
      />

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCategoria("Todas")}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              categoria === "Todas"
                ? "border-brand bg-brand-tint text-brand-ink"
                : "border-borderSoft text-textDim hover:border-brand/50"
            )}
          >
            Todas
          </button>
          {CATEGORIAS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategoria(c)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                categoria === c
                  ? "border-brand bg-brand-tint text-brand-ink"
                  : "border-borderSoft text-textDim hover:border-brand/50"
              )}
            >
              {c}
            </button>
          ))}

          <select
            value={fase}
            onChange={(e) => setFase(e.target.value as Fase | "Todas")}
            className={cn(selectClass, "ml-1")}
          >
            <option value="Todas">Todas las fases</option>
            {FASES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <NuevoEjercicioDialog />
      </div>

      {filtrados.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="Sin resultados"
          description="No hay ejercicios que coincidan con los filtros seleccionados."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtrados.map((ejercicio) => (
            <EjercicioCard key={ejercicio.id} ejercicio={ejercicio} />
          ))}
        </div>
      )}
    </>
  );
}
