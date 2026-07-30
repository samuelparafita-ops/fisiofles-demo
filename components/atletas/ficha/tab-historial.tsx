"use client";

import { Timeline } from "@/components/atletas/ficha/timeline";
import type { Atleta } from "@/lib/store";

/**
 * Timeline del proceso — las notas clínicas tienen su propio tab desde FASE 4
 * (ver `notas-clinicas.tsx`); los datos personales/clínicos y el radar viven
 * en el header compacto de la ficha (`ficha-header.tsx`).
 */
export function TabHistorial({ atleta }: { atleta: Atleta }) {
  return <Timeline atleta={atleta} />;
}
