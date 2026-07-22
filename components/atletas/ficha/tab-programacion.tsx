"use client";

import { useState } from "react";
import { CalendarX } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { ProgramacionView } from "@/components/programacion/programacion-view";
import { AplicarPlantillaDialog } from "@/components/atletas/ficha/aplicar-plantilla-dialog";
import { SesionDetalleDialog } from "@/components/atletas/ficha/sesion-detalle-dialog";
import { useProgramacionDeAtleta, type Sesion } from "@/lib/store";

export function TabProgramacion({ atletaId }: { atletaId: string }) {
  const bloques = useProgramacionDeAtleta(atletaId);
  const [sesionSeleccionada, setSesionSeleccionada] = useState<Sesion | null>(null);

  const bloquesOrdenados = [...bloques].sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-base font-bold text-textStrong">Programación</h3>
        <AplicarPlantillaDialog atletaId={atletaId} />
      </div>

      {bloquesOrdenados.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title="Sin programación asignada"
          description="Este atleta todavía no tiene ningún bloque semanal. Aplica una plantilla para generar sesiones."
        />
      ) : (
        <div className="space-y-6">
          {bloquesOrdenados.map((bloque) => (
            <ProgramacionView key={bloque.id} bloque={bloque} onEditarSesion={setSesionSeleccionada} />
          ))}
        </div>
      )}

      {sesionSeleccionada && (
        <SesionDetalleDialog sesion={sesionSeleccionada} onClose={() => setSesionSeleccionada(null)} />
      )}
    </div>
  );
}
