import { LayoutTemplate } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function PlantillasPage() {
  return (
    <>
      <PageHeader
        title="Plantillas"
        description="Plantillas de sesión y de programa reutilizables."
      />
      <EmptyState
        icon={LayoutTemplate}
        title="Plantillas próximamente"
        description="Esta sección se completa en una fase posterior."
      />
    </>
  );
}
