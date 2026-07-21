import { CalendarDays, CalendarX, ClipboardList, ListChecks, ScanFace, UserX } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadarPerfil, AcwrChart, SimetriaBar, EvolucionLine } from "@/components/charts";
import { TestsTable } from "@/components/atletas/tests-table";
import { ProgramacionView } from "@/components/programacion/programacion-view";
import { getAtleta } from "@/lib/mock/atletas";
import { getProgramacion } from "@/lib/mock/programaciones";
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
  const atleta = getAtleta(params.id);

  if (!atleta) {
    return (
      <EmptyState
        icon={UserX}
        title="Atleta no encontrado"
        description="No existe ningún atleta con este identificador en la demo."
      />
    );
  }

  const pctsSimetria = atleta.simetrias.map((s) => simetria(s.izq, s.der));
  const simetriaMedia = pctsSimetria.reduce((a, b) => a + b, 0) / pctsSimetria.length;

  const agudos = atleta.acwr.map((c) => c.agudo);
  const ultimoIdx = agudos.length - 1;
  const cronicaActual = cargaCronica(agudos, ultimoIdx);
  const ratioActual = acwr(agudos[ultimoIdx], cronicaActual);
  const zonaActual = ratioActual !== null ? zonaAcwr(ratioActual) : null;

  const dolorActual = atleta.evolucion[atleta.evolucion.length - 1]?.dolor;

  const programacion = getProgramacion(atleta.id);
  const bloqueActual = programacion?.bloques[0];

  return (
    <>
      <PageHeader
        title={atleta.nombre}
        description={`${atleta.lesion} · ${atleta.fase} · Semana ${atleta.semanaProceso}`}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Simetría media"
          value={simetriaMedia.toFixed(0)}
          unit="%"
          variation={{
            label: simetriaMedia >= 90 ? "Óptimo" : simetriaMedia >= 85 ? "Aceptable" : "Déficit",
            tone: simetriaMedia >= 90 ? "good" : simetriaMedia >= 85 ? "neutral" : "bad",
          }}
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
          variation={{
            label: dolorActual <= 2 ? "Leve" : dolorActual <= 5 ? "Moderado" : "Alto",
            tone: dolorActual <= 2 ? "good" : dolorActual <= 5 ? "neutral" : "bad",
          }}
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
            <RadarPerfil perfilFisico={atleta.perfilFisico} sexo={atleta.sexo} />
            <AcwrChart cargas={atleta.acwr} />
            <SimetriaBar simetrias={atleta.simetrias} />
            <EvolucionLine evolucion={atleta.evolucion} />
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
          <TestsTable simetrias={atleta.simetrias} />
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
