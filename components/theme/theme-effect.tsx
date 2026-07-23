"use client";

import { useEffect } from "react";
import { useConfig } from "@/lib/store";
import { acentoPorId } from "@/lib/personalizacion/acentos";

/**
 * Aplica `config.tema`/`config.acento` al DOM — sin esto, Personalización
 * solo cambiaría el store, no la app. "Oscuro" activa `.dark` en <html>
 * (app/globals.css la resuelve para toda la UI vía CSS var); "clasico-excel"
 * NO toca esta clase, es un modo por-componente de ChartPanel (ver
 * lib/theme.ts `useCockpit()`). El acento reescribe `--brand*` en vez de
 * depender de una recarga, para que la app entera (nav activo, botones,
 * chips, foco) responda al instante.
 */
export function ThemeEffect() {
  const { tema, acento } = useConfig();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", tema === "oscuro");
  }, [tema]);

  useEffect(() => {
    const def = acentoPorId(acento);
    const root = document.documentElement.style;
    root.setProperty("--brand", def.hsl.default);
    root.setProperty("--brand-tint", def.hsl.tint);
    root.setProperty("--brand-ink", def.hsl.ink);
  }, [acento]);

  return null;
}
