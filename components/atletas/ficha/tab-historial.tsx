"use client";

import { Timeline } from "@/components/atletas/ficha/timeline";
import { NotasClinicas } from "@/components/atletas/ficha/notas-clinicas";
import type { Atleta } from "@/lib/store";

/**
 * Timeline del proceso + notas clínicas — el resto del antiguo tab "General"
 * (datos personales/clínicos, radar) vive ahora en el bloque fusionado fuera
 * de las tabs, siempre visible (ver `datos-generales.tsx`, FASE 7).
 */
export function TabHistorial({ atleta }: { atleta: Atleta }) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div className="xl:col-span-2">
        <Timeline atleta={atleta} />
      </div>
      <div className="xl:col-span-2">
        <NotasClinicas atleta={atleta} />
      </div>
    </div>
  );
}
