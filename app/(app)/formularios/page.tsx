"use client";

import { ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FormularioCard } from "@/components/formularios/formulario-card";
import { FormularioDefDialog } from "@/components/formularios/formulario-def-dialog";
import { ActividadReciente } from "@/components/formularios/actividad-reciente";
import { useFormulariosDef } from "@/lib/store";

export default function FormulariosPage() {
  const formularios = useFormulariosDef();

  return (
    <>
      <PageHeader
        title="Formularios"
        description="Constrúyelos, envíalos a tus atletas y sus respuestas alimentan las gráficas al instante."
        actions={<FormularioDefDialog />}
      />

      <div className="space-y-8">
        <div>
          <h2 className="mb-3 font-display text-base font-bold text-textStrong">Mis formularios</h2>
          {formularios.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Sin formularios todavía"
              description="Crea el primero para empezar a recoger respuestas de tus atletas."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {formularios.map((f) => (
                <FormularioCard key={f.id} formulario={f} />
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-3 font-display text-base font-bold text-textStrong">Actividad reciente</h2>
          <ActividadReciente />
        </div>
      </div>
    </>
  );
}
