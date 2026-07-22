import { House } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function InicioPage() {
  return (
    <>
      <PageHeader
        title="Inicio"
        description="Resumen general y accesos rápidos."
      />
      <EmptyState
        icon={House}
        title="Página de inicio próximamente"
        description="Esta sección se completa en una fase posterior."
      />
    </>
  );
}
