import { Bell } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function NotificacionesPage() {
  return (
    <>
      <PageHeader
        title="Notificaciones"
        description="Alertas, recordatorios y tareas pendientes."
      />
      <EmptyState
        icon={Bell}
        title="Notificaciones próximamente"
        description="Esta sección se completa en una fase posterior."
      />
    </>
  );
}
