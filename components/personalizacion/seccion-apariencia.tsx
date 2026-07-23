"use client";

import { Check } from "lucide-react";
import { SeccionCard } from "./seccion-card";
import { useToast } from "@/components/shared/toast";
import { useConfig, useDispatch, type Tema } from "@/lib/store";
import { colors, colorsDark } from "@/lib/tokens";
import { ACENTOS, type AcentoId } from "@/lib/personalizacion/acentos";
import { cn } from "@/lib/utils";

const TEMAS: { id: Tema; label: string; descripcion: string }[] = [
  { id: "fisiofles", label: "Fisiofles claro", descripcion: "Tema por defecto: fondo claro, gráficos con paleta AA sobre blanco." },
  { id: "clasico-excel", label: "Clásico Excel", descripcion: "Homenaje al sistema original: colores puros sobre panel oscuro en cada gráfico." },
  { id: "oscuro", label: "Oscuro", descripcion: "Toda la interfaz en modo oscuro, misma paleta de datos que Fisiofles claro." },
];

/** Mini maqueta de barras — representa cómo queda CADA tema sin tener que activarlo. */
function PreviewTema({ tema }: { tema: Tema }) {
  const chrome = tema === "oscuro" ? colorsDark.bg : colors.bg;
  const panel = tema === "clasico-excel" ? colors.chartBg : tema === "oscuro" ? colorsDark.surface : colors.surface2;
  const barras =
    tema === "clasico-excel"
      ? [colors.data.primary, colors.data.compare, colors.data.good, colors.data.warn]
      : [colors.dataLight.primary, colors.dataLight.compare, colors.dataLight.good, colors.dataLight.warn];
  const alturas = [55, 30, 70, 45];

  return (
    <div
      className="flex h-20 w-full items-end gap-2 rounded-lg border border-black/5 p-2.5"
      style={{ background: chrome }}
    >
      <div className="flex h-full flex-1 items-end gap-1.5 rounded-md p-2" style={{ background: panel }}>
        {barras.map((color, i) => (
          <span
            key={i}
            className="flex-1 rounded-sm"
            style={{ height: `${alturas[i]}%`, background: color }}
          />
        ))}
      </div>
    </div>
  );
}

export function SeccionApariencia() {
  const config = useConfig();
  const dispatch = useDispatch();
  const toast = useToast();

  function elegirTema(tema: Tema) {
    if (tema === config.tema) return;
    dispatch({ type: "CONFIG_ACTUALIZAR", payload: { tema } });
    toast("Tema actualizado", TEMAS.find((t) => t.id === tema)?.label);
  }

  function elegirAcento(acento: AcentoId) {
    if (acento === config.acento) return;
    dispatch({ type: "CONFIG_ACTUALIZAR", payload: { acento } });
    toast("Color de acento actualizado", ACENTOS.find((a) => a.id === acento)?.label);
  }

  return (
    <SeccionCard
      id="apariencia"
      title="Apariencia"
      description="Tema visual y color de acento de toda la aplicación. Se aplica al instante."
    >
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-textDim">Tema</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {TEMAS.map((t) => {
            const activo = config.tema === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => elegirTema(t.id)}
                className={cn(
                  "flex flex-col gap-3 rounded-xl border p-3 text-left transition-colors",
                  activo ? "border-brand ring-1 ring-brand" : "border-borderSoft hover:border-brand/50"
                )}
              >
                <PreviewTema tema={t.id} />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-textStrong">{t.label}</span>
                    {activo && <Check className="size-3.5 text-brand-ink" />}
                  </div>
                  <p className="mt-0.5 text-xs text-textDim">{t.descripcion}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 border-t border-borderSoft pt-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-textDim">Color de acento</p>
        <div className="flex flex-wrap gap-3">
          {ACENTOS.map((a) => {
            const activo = config.acento === a.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => elegirAcento(a.id)}
                aria-label={a.label}
                aria-pressed={activo}
                title={a.label}
                className={cn(
                  "flex size-10 items-center justify-center rounded-full border-2 transition-transform",
                  activo ? "border-textStrong scale-105" : "border-transparent hover:scale-105"
                )}
              >
                <span className="flex size-8 items-center justify-center rounded-full" style={{ background: a.hex }}>
                  {activo && <Check className="size-4 text-white" strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-textDim">
          Paleta cerrada de {ACENTOS.length} acentos pensados para mantener buen contraste — no hay selector de color libre.
        </p>
      </div>
    </SeccionCard>
  );
}
