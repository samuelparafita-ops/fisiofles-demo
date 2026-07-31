"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListaReordenable } from "@/components/personalizacion/lista-reordenable";
import { SelectorRango } from "@/components/dashboard/selector-rango";
import type { GraficoDef } from "@/lib/dashboard/graficos";
import type { Atleta } from "@/lib/store";
import type { InformeDraft } from "./informe-wizard";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

/** Paso 1 del generador de informes: atleta + gráficas (checkboxes + flechas, catálogo existente) + comentario + rango. */
export function PasoConfigurar({
  atletas,
  graficosCatalogo,
  draft,
  onChange,
  onContinuar,
}: {
  atletas: Atleta[];
  graficosCatalogo: GraficoDef[];
  draft: InformeDraft;
  onChange: (next: InformeDraft) => void;
  onContinuar: () => void;
}) {
  const router = useRouter();
  const atletasOrdenados = [...atletas].sort((a, b) => a.nombre.localeCompare(b.nombre));
  const itemsGraficos = graficosCatalogo.map((g) => ({ id: g.id, label: g.titulo, descripcion: g.descripcion }));
  const puedeContinuar = Boolean(draft.atletaId) && draft.graficosVisibles.length > 0;

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-10">
        <header className="mb-6 flex items-start justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={() => router.push("/clinica")}
              className="mb-2 flex items-center gap-1.5 text-sm text-textDim transition-colors hover:text-textStrong"
            >
              <ArrowLeft className="size-3.5" />
              Volver a Clínica
            </button>
            <h1 className="font-display text-2xl font-bold tracking-tight text-textStrong">Generar informe</h1>
            <p className="mt-1 text-sm text-textDim">Elige el atleta, las gráficas y añade un comentario clínico.</p>
          </div>
          <div className="mt-1 flex shrink-0 items-center gap-1 rounded-full border border-borderSoft bg-surface2 px-3 py-1 text-xs text-textDim">
            <FlaskConical className="size-3.5" />
            Demo · datos ficticios
          </div>
        </header>

        <div className="space-y-6">
          <section className="rounded-xl border border-borderSoft bg-surface2 p-5 shadow-sm">
            <label htmlFor="informe-atleta" className="block text-xs font-semibold uppercase tracking-wide text-textDim">
              Atleta
            </label>
            <select
              id="informe-atleta"
              className={`${selectClass} mt-1.5`}
              value={draft.atletaId}
              onChange={(e) => onChange({ ...draft, atletaId: e.target.value })}
            >
              <option value="" disabled>
                Elige un atleta…
              </option>
              {atletasOrdenados.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </section>

          <section className="rounded-xl border border-borderSoft bg-surface2 p-5 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="font-display text-sm font-bold text-textStrong">Gráficas</h2>
              <span className="text-xs text-textDim">{draft.graficosVisibles.length} seleccionadas</span>
            </div>
            <p className="mb-2 text-xs text-textDim">
              Marca las gráficas a incluir en el informe y ordénalas con las flechas.
            </p>
            <ListaReordenable
              catalogo={itemsGraficos}
              visibles={draft.graficosVisibles}
              orden={draft.graficosOrden}
              onChange={({ visibles, orden }) => onChange({ ...draft, graficosVisibles: visibles, graficosOrden: orden })}
            />
          </section>

          <section className="rounded-xl border border-borderSoft bg-surface2 p-5 shadow-sm">
            <label className="block text-xs font-semibold uppercase tracking-wide text-textDim">Rango temporal</label>
            <div className="mt-2">
              <SelectorRango valor={draft.rango} onChange={(rango) => onChange({ ...draft, rango })} />
            </div>
          </section>

          <section className="rounded-xl border border-borderSoft bg-surface2 p-5 shadow-sm">
            <label htmlFor="informe-comentario" className="block text-xs font-semibold uppercase tracking-wide text-textDim">
              Comentario clínico
            </label>
            <textarea
              id="informe-comentario"
              value={draft.comentario}
              onChange={(e) => onChange({ ...draft, comentario: e.target.value })}
              rows={5}
              placeholder="Valoración del profesional para este informe…"
              className="mt-1.5 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </section>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          {!puedeContinuar && <p className="text-xs text-textDim">Elige un atleta y al menos una gráfica.</p>}
          <Button type="button" onClick={onContinuar} disabled={!puedeContinuar}>
            Ver vista previa
          </Button>
        </div>
      </div>
    </div>
  );
}
