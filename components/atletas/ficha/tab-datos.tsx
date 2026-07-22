"use client";

import { ScanFace } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { RadarPerfil, AcwrChart, SimetriaBar, EvolucionLine } from "@/components/charts";
import { TestsTable } from "@/components/atletas/tests-table";
import { RegistrarTestDialog } from "@/components/atletas/ficha/registrar-test-dialog";
import { simetriasDesdeRegistros, useCatalogoTests, useConfig, useRegistrosDeAtleta, type Atleta } from "@/lib/store";

export function TabDatos({ atleta }: { atleta: Atleta }) {
  const registros = useRegistrosDeAtleta(atleta.id);
  const catalogo = useCatalogoTests();
  const config = useConfig();

  const { umbrales } = config;
  const umbralesSimetria = { aceptable: umbrales.simetriaAceptable, optimo: umbrales.simetriaObjetivo };
  const umbralesAcwr = { bajo: umbrales.acwrBajo, alto: umbrales.acwrAlto };

  const simetrias = simetriasDesdeRegistros(registros, catalogo);

  const PANELES: Record<string, JSX.Element> = {
    "perfil-fisico":
      atleta.perfilFisico.length > 0 ? (
        <RadarPerfil key="perfil-fisico" perfilFisico={atleta.perfilFisico} sexo={atleta.sexo} />
      ) : (
        <EmptyState
          key="perfil-fisico"
          icon={ScanFace}
          title="Perfil físico incompleto"
          description="Este atleta todavía no tiene medidas suficientes para el radar de perfil físico."
        />
      ),
    acwr: <AcwrChart key="acwr" cargas={atleta.acwr} umbrales={umbralesAcwr} />,
    simetrias: <SimetriaBar key="simetrias" simetrias={simetrias} umbrales={umbralesSimetria} />,
    evolucion: <EvolucionLine key="evolucion" evolucion={atleta.evolucion} />,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {config.ordenDashboard
          .filter((id) => config.metricasVisiblesDashboard.includes(id))
          .map((id) => PANELES[id])}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-display text-base font-bold text-textStrong">Histórico de tests</h3>
          <RegistrarTestDialog atletaId={atleta.id} />
        </div>
        <TestsTable registros={registros} catalogo={catalogo} umbrales={umbralesSimetria} />
      </div>
    </div>
  );
}
