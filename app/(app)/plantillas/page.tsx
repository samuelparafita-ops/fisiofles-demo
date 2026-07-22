"use client";

import { CalendarRange, LayoutTemplate } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlantillaSesionCard } from "@/components/plantillas/plantilla-sesion-card";
import { PlantillaProgramaCard } from "@/components/plantillas/plantilla-programa-card";
import { PlantillaSesionDialog } from "@/components/plantillas/plantilla-sesion-dialog";
import { PlantillaProgramaDialog } from "@/components/plantillas/plantilla-programa-dialog";
import { usePlantillasPrograma, usePlantillasSesion } from "@/lib/store";

export default function PlantillasPage() {
  const plantillasSesion = usePlantillasSesion();
  const plantillasPrograma = usePlantillasPrograma();

  return (
    <>
      <PageHeader
        title="Plantillas"
        description="Sistematiza sesiones y programas reutilizables para aplicar a cualquier atleta."
      />

      <Tabs defaultValue="sesiones">
        <TabsList className="w-max">
          <TabsTrigger value="sesiones" className="gap-1.5">
            <LayoutTemplate className="size-3.5" />
            Sesiones
          </TabsTrigger>
          <TabsTrigger value="programas" className="gap-1.5">
            <CalendarRange className="size-3.5" />
            Programas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sesiones" className="mt-6">
          <div className="mb-4 flex justify-end">
            <PlantillaSesionDialog />
          </div>
          {plantillasSesion.length === 0 ? (
            <EmptyState
              icon={LayoutTemplate}
              title="Sin plantillas de sesión"
              description="Crea la primera plantilla de sesión reutilizable."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {plantillasSesion.map((p) => (
                <PlantillaSesionCard key={p.id} plantilla={p} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="programas" className="mt-6">
          <div className="mb-4 flex justify-end">
            <PlantillaProgramaDialog />
          </div>
          {plantillasPrograma.length === 0 ? (
            <EmptyState
              icon={CalendarRange}
              title="Sin plantillas de programa"
              description="Crea el primer bloque multi-semana reutilizable."
            />
          ) : (
            <div className="space-y-4">
              {plantillasPrograma.map((p) => (
                <PlantillaProgramaCard key={p.id} plantilla={p} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
