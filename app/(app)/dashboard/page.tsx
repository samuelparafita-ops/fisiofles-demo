import { ChartNoAxesCombined } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Métricas y evolución agregada de los atletas."
      />
      <EmptyState
        icon={ChartNoAxesCombined}
        title="Dashboard próximamente"
        description="Esta sección se completa en una fase posterior."
      />
    </>
  );
}
