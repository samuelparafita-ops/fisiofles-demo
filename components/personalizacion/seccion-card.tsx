import type { ReactNode } from "react";

/** Envoltorio sobrio compartido por las 4 secciones de Personalización. */
export function SeccionCard({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 rounded-xl border border-borderSoft bg-surface2 p-6 shadow-sm">
      <h2 className="font-display text-lg font-bold text-textStrong">{title}</h2>
      {description && <p className="mt-1 text-sm text-textDim">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Fila label + control, usada dentro de cada sección para un control puntual. */
export function CampoControl({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-borderSoft py-4 first:border-t-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-textStrong">{label}</p>
        {description && <p className="mt-0.5 text-xs text-textDim">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
