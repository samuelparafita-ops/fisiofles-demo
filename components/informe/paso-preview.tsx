"use client";

import { ArrowLeft, Building2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GraficoTest, GraficoResultado } from "@/components/charts";
import { TemaForzado } from "@/lib/theme";
import { resultadoIdDeGrafico, type GraficoDef } from "@/lib/dashboard/graficos";
import { rangoDesdeSemanas } from "@/lib/dashboard/series-tests";
import { colorSemaforo, colorSemaforoTexto } from "@/lib/calculations";
import { fmtFechaLarga, hoyIso } from "@/components/atletas/ficha/fecha-utils";
import {
  useAtletas,
  useCatalogoTests,
  useConfig,
  useFaseDeAtleta,
  useRegistrosTests,
  useSesiones,
  type Atleta,
} from "@/lib/store";
import type { InformeDraft } from "./informe-wizard";

/** Ancho fijo del documento — A4 a 96dpi. Mismo valor en pantalla e impresión
 * (esta ruta no tiene sidebar/topbar que ocultar, así que el contenedor no
 * cambia de tamaño entre vista previa e impresión) para que los
 * `ResponsiveContainer` de Recharts midan siempre el mismo ancho — ver
 * CLAUDE.md > brief FASE 7 sobre el riesgo de medir mal al imprimir. */
const ANCHO_INFORME_PX = 794;

function rangoADesdeHasta(valor: InformeDraft["rango"]): { desde: Date; hasta: Date } {
  if (valor.tipo === "personalizado") {
    return { desde: new Date(`${valor.desde}T00:00:00`), hasta: new Date(`${valor.hasta}T00:00:00`) };
  }
  return rangoDesdeSemanas(valor.semanas);
}

/** Paso 2 del generador de informes: documento imprimible (cabecera del profesional + datos del atleta + gráficas + comentario) y exportar vía `window.print()`. */
export function PasoPreview({
  atleta,
  draft,
  graficosCatalogo,
  onVolver,
}: {
  atleta: Atleta;
  draft: InformeDraft;
  graficosCatalogo: GraficoDef[];
  onVolver: () => void;
}) {
  const todosAtletas = useAtletas();
  const registrosTests = useRegistrosTests();
  const catalogoTests = useCatalogoTests();
  const sesiones = useSesiones();
  const config = useConfig();
  const faseDe = useFaseDeAtleta(atleta);

  const { desde, hasta } = rangoADesdeHasta(draft.rango);

  const activos = todosAtletas.filter((a) => a.estado === "activo");
  const equipo = activos.some((a) => a.id === atleta.id) ? activos : [atleta, ...activos];

  const ordenIds = draft.graficosOrden.length > 0 ? draft.graficosOrden : graficosCatalogo.map((g) => g.id);
  const graficosVisibles = ordenIds
    .filter((id) => draft.graficosVisibles.includes(id))
    .map((id) => graficosCatalogo.find((g) => g.id === id))
    .filter((g): g is GraficoDef => g !== undefined);

  return (
    <div className="min-h-screen bg-bg py-6 print:bg-white print:py-0">
      <div
        className="mx-auto mb-4 flex items-center justify-between px-4 print:hidden"
        style={{ width: ANCHO_INFORME_PX, maxWidth: "100%" }}
      >
        <Button type="button" variant="outline" onClick={onVolver}>
          <ArrowLeft className="size-3.5" />
          Volver a configurar
        </Button>
        <Button type="button" onClick={() => window.print()}>
          <Printer className="size-3.5" />
          Imprimir / Exportar PDF
        </Button>
      </div>

      {/* El documento es SIEMPRE claro (acaba en papel): `.tema-claro` deshace
          `.dark` para las CSS vars y `TemaForzado` hace lo propio con los
          colores inline de Recharts — ver lib/theme.ts. */}
      <TemaForzado tema="fisiofles">
        <div
          className="tema-claro mx-auto bg-surface2 text-text shadow-lg print:shadow-none"
          style={{ width: ANCHO_INFORME_PX, maxWidth: "100%" }}
        >
          <div className="p-10 print:p-0">
            <header className="flex items-start justify-between gap-6 border-b border-borderSoft pb-5">
              <div className="flex items-center gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-dashed border-borderSoft text-textDim">
                  <Building2 className="size-6" />
                </div>
                <div>
                  <p className="font-display text-base font-bold text-textStrong">{config.perfilProfesional.nombre}</p>
                  <p className="text-xs text-textDim">
                    {config.perfilProfesional.rol} · Nº col. {config.perfilProfesional.numColegiado}
                  </p>
                  <p className="text-xs text-textDim">{config.perfilProfesional.clinica}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display text-sm font-bold text-textStrong">Informe clínico</p>
                <p className="text-xs text-textDim">{fmtFechaLarga(hoyIso())}</p>
              </div>
            </header>

            <section className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-borderSoft pb-5">
              <div>
                <p className="font-display text-lg font-bold text-textStrong">{atleta.nombre}</p>
                <p className="text-xs text-textDim">{atleta.deporte}</p>
              </div>
              {faseDe ? (
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{
                    background: `${colorSemaforo(faseDe.indiceFase, faseDe.totalFases)}1A`,
                    color: colorSemaforoTexto(faseDe.indiceFase, faseDe.totalFases),
                  }}
                >
                  {faseDe.tipoLesion.nombre} · {faseDe.fase.nombre}
                </span>
              ) : (
                <span className="rounded-full border border-borderSoft px-2.5 py-1 text-xs font-medium text-textDim">
                  {atleta.lesion}
                </span>
              )}
            </section>

            {draft.comentario.trim() && (
              <section className="mt-5 break-inside-avoid">
                <h2 className="font-display text-sm font-bold text-textStrong">Comentario clínico</h2>
                <p className="mt-1.5 whitespace-pre-wrap text-sm text-text">{draft.comentario}</p>
              </section>
            )}

            <section className="mt-6 space-y-6">
              {graficosVisibles.map((def) => (
                <div key={def.id} className="break-inside-avoid">
                  {def.origen === "test" || def.tipo === "dispersion" ? (
                    <GraficoTest
                      def={def}
                      registros={registrosTests}
                      catalogo={catalogoTests}
                      atletas={equipo}
                      atletasSeleccionados={[atleta.id]}
                      umbrales={config.umbrales}
                      desde={desde}
                      hasta={hasta}
                    />
                  ) : (
                    <GraficoResultado
                      id={resultadoIdDeGrafico(def.id)}
                      def={def}
                      atletas={equipo}
                      atletasSeleccionados={[atleta.id]}
                      registros={registrosTests}
                      catalogo={catalogoTests}
                      sesiones={sesiones}
                      umbrales={config.umbrales}
                      desde={desde}
                      hasta={hasta}
                    />
                  )}
                </div>
              ))}
            </section>

            <footer className="mt-8 border-t border-borderSoft pt-4 text-center text-[11px] text-textDim">
              Generado con Fisiofles · Demo, datos ficticios
            </footer>
          </div>
        </div>
      </TemaForzado>
    </div>
  );
}
