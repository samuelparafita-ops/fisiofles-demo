"use client";

import { CalendarDays, CalendarX, ClipboardList, ListChecks, Pencil, ScanFace, UserX } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RadarPerfil, AcwrChart, SimetriaBar, EvolucionLine } from "@/components/charts";
import { TestsTable } from "@/components/atletas/tests-table";
import { NuevoAtletaDialog } from "@/components/atletas/nuevo-atleta-dialog";
import { ProgramacionView } from "@/components/programacion/programacion-view";
import {
  simetriasDesdeRegistros,
  useAtleta,
  useCatalogoTests,
  useConfig,
  useProgramacionDeAtleta,
  useRegistrosDeAtleta,
} from "@/lib/store";
import { simetria, cargaCronica, acwr, zonaAcwr } from "@/lib/calculations";

const TABS = [
  { value: "resumen", label: "Resumen", icon: ScanFace },
  { value: "programacion", label: "Programación", icon: CalendarDays },
  { value: "formularios", label: "Formularios", icon: ClipboardList },
  { value: "tests", label: "Tests", icon: ListChecks },
];

const PLACEHOLDER_TABS = new Set(["formularios"]);

export default function AtletaDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const atleta = useAtleta(params.id);
  const registros = useRegistrosDeAtleta(params.id);
  const catalogo = useCatalogoTests();
  const config = useConfig();
  const bloques = useProgramacionDeAtleta(params.id);

  if (!atleta) {
    return (
      <EmptyState
        icon={UserX}
        title="Atleta no encontrado"
        description="No existe ningún atleta con este identificador en la demo."
      />
    );
  }

  const { umbrales } = config;
  const umbralesSimetria = { aceptable: umbrales.simetriaAceptable, optimo: umbrales.simetriaObjetivo };
  const umbralesAcwr = { bajo: umbrales.acwrBajo, alto: umbrales.acwrAlto };

  const simetrias = simetriasDesdeRegistros(registros, catalogo);
  const pctsSimetria = simetrias.map((s) => simetria(s.izq, s.der));
  const simetriaMedia =
    pctsSimetria.length > 0 ? pctsSimetria.reduce((a, b) => a + b, 0) / pctsSimetria.length : null;

  const agudos = atleta.acwr.map((c) => c.agudo);
  const ultimoIdx = agudos.length - 1;
  const cronicaActual = ultimoIdx >= 0 ? cargaCronica(agudos, ultimoIdx) : null;
  const ratioActual = ultimoIdx >= 0 ? acwr(agudos[ultimoIdx], cronicaActual) : null;
  const zonaActual = ratioActual !== null ? zonaAcwr(ratioActual, umbralesAcwr) : null;

  const dolorActual = atleta.evolucion[atleta.evolucion.length - 1]?.dolor;

  const bloqueActual = bloques[0];

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
    <>
      <PageHeader
        title={atleta.nombre}
        description={`${atleta.lesion} · ${atleta.fase} · Semana ${atleta.semanaProceso}`}
        actions={
          <NuevoAtletaDialog
            atleta={atleta}
            trigger={
              <Button variant="outline" size="icon" aria-label="Editar atleta">
                <Pencil className="size-4" />
              </Button>
            }
          />
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Simetría media"
          value={simetriaMedia !== null ? simetriaMedia.toFixed(0) : "N/D"}
          unit={simetriaMedia !== null ? "%" : undefined}
          variation={
            simetriaMedia !== null
              ? {
                  label:
                    simetriaMedia >= umbrales.simetriaObjetivo
                      ? "Óptimo"
                      : simetriaMedia >= umbrales.simetriaAceptable
                        ? "Aceptable"
                        : "Déficit",
                  tone:
                    simetriaMedia >= umbrales.simetriaObjetivo
                      ? "good"
                      : simetriaMedia >= umbrales.simetriaAceptable
                        ? "neutral"
                        : "bad",
                }
              : undefined
          }
        />
        <StatCard label="Semanas en proceso" value={atleta.semanaProceso} unit="sem." />
        <StatCard
          label="ACWR actual"
          value={ratioActual !== null ? ratioActual.toFixed(2) : "N/D"}
          unit="ratio"
          variation={
            zonaActual
              ? {
                  label:
                    zonaActual === "optima"
                      ? "Zona óptima"
                      : zonaActual === "riesgo"
                        ? "Riesgo"
                        : "Insuficiente",
                  tone: zonaActual === "optima" ? "good" : zonaActual === "riesgo" ? "bad" : "neutral",
                }
              : undefined
          }
        />
        <StatCard
          label="Dolor actual"
          value={dolorActual}
          unit="/10"
          variation={
            dolorActual !== undefined
              ? {
                  label: dolorActual <= 2 ? "Leve" : dolorActual <= 5 ? "Moderado" : "Alto",
                  tone: dolorActual <= 2 ? "good" : dolorActual <= 5 ? "neutral" : "bad",
                }
              : undefined
          }
        />
      </div>

      <Tabs defaultValue="resumen">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <TabsList className="w-max">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="shrink-0">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value="resumen" className="mt-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {config.ordenDashboard
              .filter((paneles) => config.metricasVisiblesDashboard.includes(paneles))
              .map((idPanel) => PANELES[idPanel])}
          </div>
        </TabsContent>
        <TabsContent value="programacion" className="mt-6">
          {bloqueActual ? (
            <ProgramacionView bloque={bloqueActual} />
          ) : (
            <EmptyState
              icon={CalendarX}
              title="Sin programación asignada"
              description="Este atleta todavía no tiene una programación semanal en la demo."
            />
          )}
        </TabsContent>
        <TabsContent value="tests" className="mt-6">
          <TestsTable simetrias={simetrias} umbrales={umbralesSimetria} />
        </TabsContent>
        {TABS.filter((tab) => PLACEHOLDER_TABS.has(tab.value)).map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-6">
            <EmptyState
              icon={tab.icon}
              title={`Panel de ${tab.label.toLowerCase()}`}
              description="Este panel se completará en una fase posterior."
            />
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}
