"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { ParrillaSemanal } from "@/components/programacion/parrilla-semanal";
import { ModoAtleta } from "@/components/programacion/modo-atleta";
import { cn } from "@/lib/utils";

type Modo = "parrilla" | "atleta";

const MODOS: { value: Modo; label: string }[] = [
  { value: "parrilla", label: "Parrilla semanal" },
  { value: "atleta", label: "Modo atleta" },
];

export default function ProgramacionPage() {
  const [modo, setModo] = useState<Modo>("parrilla");

  return (
    <>
      <PageHeader
        title="Programación"
        description="Espacio de trabajo de programación: parrilla semanal de todo el equipo, o el módulo completo de un atleta."
      />

      <div className="mb-6 flex w-fit items-center gap-0.5 rounded-lg border border-borderSoft bg-bg p-0.5">
        {MODOS.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setModo(m.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              modo === m.value ? "bg-surface2 text-brand-ink shadow-sm" : "text-textDim hover:text-textStrong"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {modo === "parrilla" ? <ParrillaSemanal /> : <ModoAtleta />}
    </>
  );
}
