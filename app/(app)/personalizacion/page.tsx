import { PageHeader } from "@/components/shared/page-header";
import { SeccionApariencia } from "@/components/personalizacion/seccion-apariencia";
import { SeccionMetricas } from "@/components/personalizacion/seccion-metricas";
import { SeccionVariablesCalculo } from "@/components/personalizacion/seccion-variables-calculo";
import { SeccionDatosDemo } from "@/components/personalizacion/seccion-datos-demo";

const SECCIONES = [
  { id: "apariencia", label: "Apariencia" },
  { id: "metricas-dashboard", label: "Métricas y dashboard" },
  { id: "variables-calculo", label: "Variables de cálculo" },
  { id: "datos-demo", label: "Datos de la demo" },
];

export default function PersonalizacionPage() {
  return (
    <>
      <PageHeader
        title="Personalización"
        description="Tema, umbrales clínicos y métricas visibles del dashboard. Los cambios se aplican y se guardan al instante."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_1fr]">
        <nav className="hidden lg:block">
          <div className="sticky top-20 space-y-1">
            {SECCIONES.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block rounded-md px-3 py-2 text-sm font-medium text-textDim transition-colors hover:bg-borderSoft hover:text-textStrong"
              >
                {s.label}
              </a>
            ))}
          </div>
        </nav>
        <div className="min-w-0 space-y-6">
          <SeccionApariencia />
          <SeccionMetricas />
          <SeccionVariablesCalculo />
          <SeccionDatosDemo />
        </div>
      </div>
    </>
  );
}
