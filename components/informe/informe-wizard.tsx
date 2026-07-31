"use client";

import { useMemo, useState } from "react";
import { catalogoGraficos } from "@/lib/dashboard/graficos";
import { RANGO_DASHBOARD_DEFECTO, type RangoDashboardValor } from "@/components/dashboard/selector-rango";
import { useAtletas, useCatalogoTests, useConfig } from "@/lib/store";
import { PasoConfigurar } from "./paso-configurar";
import { PasoPreview } from "./paso-preview";

export type InformeDraft = {
  atletaId: string;
  graficosVisibles: string[];
  graficosOrden: string[];
  comentario: string;
  rango: RangoDashboardValor;
};

/**
 * Wizard de 2 pasos del generador de informes (FASE 7): Configurar (atleta +
 * gráficas del catálogo existente, reordenables + comentario + rango) →
 * Vista previa/exportar. Vive en `/clinica/informe` (grupo de rutas propio,
 * SIN sidebar/topbar — ver `app/(informe)/`), así el paso 2 no necesita CSS
 * de impresión para ocultar el chrome de la app: no lo renderiza nadie aquí.
 */
export function InformeWizard() {
  const atletas = useAtletas();
  const catalogoTests = useCatalogoTests();
  const config = useConfig();

  const graficosCatalogo = useMemo(() => catalogoGraficos(catalogoTests), [catalogoTests]);

  const [paso, setPaso] = useState<1 | 2>(1);
  const [draft, setDraft] = useState<InformeDraft>(() => ({
    atletaId: atletas.find((a) => a.estado === "activo")?.id ?? atletas[0]?.id ?? "",
    graficosVisibles: config.fichaGraficos,
    graficosOrden:
      config.fichaGraficosOrden.length > 0 ? config.fichaGraficosOrden : graficosCatalogo.map((g) => g.id),
    comentario: "",
    rango: RANGO_DASHBOARD_DEFECTO,
  }));

  const atletaSeleccionado = atletas.find((a) => a.id === draft.atletaId);

  if (paso === 2 && atletaSeleccionado) {
    return (
      <PasoPreview
        atleta={atletaSeleccionado}
        draft={draft}
        graficosCatalogo={graficosCatalogo}
        onVolver={() => setPaso(1)}
      />
    );
  }

  return (
    <PasoConfigurar
      atletas={atletas}
      graficosCatalogo={graficosCatalogo}
      draft={draft}
      onChange={setDraft}
      onContinuar={() => setPaso(2)}
    />
  );
}
