"use client";

import { useMemo } from "react";
import { Activity, CalendarDays, ClipboardList, Dumbbell, UserRound, UserX } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FichaHeader } from "@/components/atletas/ficha/ficha-header";
import { TabGeneral } from "@/components/atletas/ficha/tab-general";
import { TabCalendario } from "@/components/atletas/ficha/tab-calendario";
import { TabDatos } from "@/components/atletas/ficha/tab-datos";
import { TabProgramacion } from "@/components/atletas/ficha/tab-programacion";
import { TabFormularios } from "@/components/atletas/ficha/tab-formularios";
import { CajaHallazgos } from "@/components/atletas/caja-hallazgos";
import {
  useAtleta,
  useCatalogoTests,
  useConfig,
  useFormulariosEnvios,
  useRegistrosTests,
  useSesiones,
} from "@/lib/store";
import { generarHallazgos } from "@/lib/insights";

const TABS = [
  { value: "general", label: "General", icon: UserRound },
  { value: "calendario", label: "Calendario", icon: CalendarDays },
  { value: "datos", label: "Datos", icon: Activity },
  { value: "programacion", label: "Programación", icon: Dumbbell },
  { value: "formularios", label: "Formularios", icon: ClipboardList },
];

export default function AtletaDetailPage({ params }: { params: { id: string } }) {
  const atleta = useAtleta(params.id);
  const sesiones = useSesiones();
  const registrosTests = useRegistrosTests();
  const catalogoTests = useCatalogoTests();
  const formulariosEnvios = useFormulariosEnvios();
  const config = useConfig();

  const hallazgosAtleta = useMemo(() => {
    if (!atleta) return [];
    return generarHallazgos({
      atletas: [atleta],
      sesiones,
      registrosTests,
      catalogoTests,
      formulariosEnvios,
      config,
    });
  }, [atleta, sesiones, registrosTests, catalogoTests, formulariosEnvios, config]);

  if (!atleta) {
    return (
      <EmptyState
        icon={UserX}
        title="Atleta no encontrado"
        description="No existe ningún atleta con este identificador en la demo."
      />
    );
  }

  return (
    <>
      <FichaHeader atleta={atleta} />

      <CajaHallazgos
        hallazgos={hallazgosAtleta}
        titulo="Hallazgos"
        mostrarAtleta={false}
        className="mb-6"
        vacioTitulo="Sin hallazgos"
        vacioDescripcion="No hay hallazgos registrados para este atleta ahora mismo."
      />

      <Tabs defaultValue="general">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <TabsList className="w-max">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="shrink-0 gap-1.5">
                <tab.icon className="size-3.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="general" className="mt-6">
          <TabGeneral atleta={atleta} />
        </TabsContent>
        <TabsContent value="calendario" className="mt-6">
          <TabCalendario atletaId={atleta.id} />
        </TabsContent>
        <TabsContent value="datos" className="mt-6">
          <TabDatos atleta={atleta} />
        </TabsContent>
        <TabsContent value="programacion" className="mt-6">
          <TabProgramacion atletaId={atleta.id} />
        </TabsContent>
        <TabsContent value="formularios" className="mt-6">
          <TabFormularios atleta={atleta} />
        </TabsContent>
      </Tabs>
    </>
  );
}
