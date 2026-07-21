import { ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function FormulariosPage() {
  return (
    <>
      <PageHeader
        title="Formularios"
        description="Constructor y listado de formularios clínicos."
      />
      <EmptyState
        icon={ClipboardList}
        title="Constructor de formularios próximamente"
        description="Esta sección se completa en una fase posterior."
      />
    </>
  );
}
