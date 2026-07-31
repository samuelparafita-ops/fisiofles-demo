"use client";

import { useEffect, useMemo, useState } from "react";
import { Dumbbell, Tag } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { EjercicioCard } from "@/components/ejercicios/ejercicio-card";
import { NuevoEjercicioDialog } from "@/components/ejercicios/nuevo-ejercicio-dialog";
import { SelectorFiltro, type OpcionFiltro } from "@/components/dashboard/selector-filtro";
import { CATEGORIAS, FASES, type Categoria, type Fase } from "@/lib/mock/ejercicios";
import { useEjercicios } from "@/lib/store";

const selectClass =
  "flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export default function EjerciciosPage() {
  const ejercicios = useEjercicios();
  const [categoria, setCategoria] = useState<Categoria | "Todas">("Todas");
  const [fase, setFase] = useState<Fase | "Todas">("Todas");
  const [etiquetasSel, setEtiquetasSel] = useState<string[]>([]);

  // Solo etiquetas EN USO por algún ejercicio de la librería — si ninguna
  // carta lleva "CORE", no aparece la opción (misma filosofía que el filtro
  // de lesión de /dashboard).
  const etiquetasOpciones: OpcionFiltro[] = useMemo(() => {
    const todas = ejercicios.flatMap((e) => e.etiquetas ?? []);
    return Array.from(new Set(todas))
      .sort((a, b) => a.localeCompare(b))
      .map((t) => ({ value: t, label: t }));
  }, [ejercicios]);

  useEffect(() => {
    setEtiquetasSel((prev) => prev.filter((t) => etiquetasOpciones.some((o) => o.value === t)));
  }, [etiquetasOpciones]);

  const filtrados = useMemo(() => {
    return ejercicios.filter((e) => {
      const matchCategoria = categoria === "Todas" || e.categoria === categoria;
      const matchFase = fase === "Todas" || e.fasesSugeridas.includes(fase);
      const matchEtiquetas =
        etiquetasSel.length === 0 || (e.etiquetas ?? []).some((t) => etiquetasSel.includes(t));
      return matchCategoria && matchFase && matchEtiquetas;
    });
  }, [categoria, fase, etiquetasSel, ejercicios]);

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

          <SelectorFiltro
            label="Etiquetas"
            icon={Tag}
            opciones={etiquetasOpciones}
            seleccionados={etiquetasSel}
            onChange={setEtiquetasSel}
          />
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
