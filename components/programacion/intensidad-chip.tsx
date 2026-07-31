"use client";

import { intensidadSesion, type IntensidadSesion } from "@/lib/calculations";
import { useConfig } from "@/lib/store";
import { useStateColors } from "@/lib/theme";

const INTENSIDAD_LABEL: Record<IntensidadSesion, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
};

/**
 * Chip de intensidad de sesión — SIEMPRE calculada a partir del RPE objetivo
 * y `config.umbrales.rpeLow/rpeHigh` (ver `lib/calculations/intensidad.ts`),
 * nunca guardada. Colores de estado (good/warn/bad) vía `useStateColors`.
 */
export function ChipIntensidad({ rpe, className }: { rpe: number; className?: string }) {
  const { umbrales } = useConfig();
  const estado = useStateColors();
  const intensidad = intensidadSesion(rpe, umbrales);
  const color = intensidad === "low" ? estado.good : intensidad === "high" ? estado.bad : estado.warn;

  return (
    <span
      className={className ? `${className} inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold` : "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"}
      style={{ background: `${color}1A`, color }}
    >
      {INTENSIDAD_LABEL[intensidad]}
    </span>
  );
}
