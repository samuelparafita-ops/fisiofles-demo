import { Settings2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function PersonalizacionPage() {
  return (
    <>
      <PageHeader
        title="Personalización"
        description="Tema, umbrales clínicos y métricas visibles del dashboard."
      />
      <EmptyState
        icon={Settings2}
        title="Personalización próximamente"
        description="Esta sección se completa en una fase posterior."
      />
    </>
  );
}
