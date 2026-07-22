"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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

const TAB_VALUES = TABS.map((t) => t.value);

export default function AtletaDetailPage({ params }: { params: { id: string } }) {
  const atleta = useAtleta(params.id);
  const sesiones = useSesiones();
  const registrosTests = useRegistrosTests();
  const catalogoTests = useCatalogoTests();
  const formulariosEnvios = useFormulariosEnvios();
  const config = useConfig();

  // Deep-link de notificaciones/hallazgos: `?tab=datos` abre esa pestaña al
  // entrar. Controlado (no `defaultValue`) para reaccionar también si el
  // usuario navega entre notificaciones del mismo atleta sin desmontar la
  // página (mismo segmento dinámico, solo cambia la query string).
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [tab, setTab] = useState(() => (tabParam && TAB_VALUES.includes(tabParam) ? tabParam : "general"));

  useEffect(() => {
    if (tabParam && TAB_VALUES.includes(tabParam)) {
      setTab(tabParam);
    }
  }, [tabParam]);

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

      <Tabs value={tab} onValueChange={setTab}>
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <TabsList className="w-max">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="shrink-0 gap-1.5">
                <t.icon className="size-3.5" />
                {t.label}
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
