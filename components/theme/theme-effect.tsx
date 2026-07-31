"use client";

import { useEffect } from "react";
import { useConfig } from "@/lib/store";
import { acentoPorId } from "@/lib/personalizacion/acentos";

/**
 * Aplica `config.tema`/`config.acento` al DOM — sin esto, Personalización
 * solo cambiaría el store, no la app. "Oscuro" activa `.dark` en <html>
 * (app/globals.css la resuelve para toda la UI vía CSS var). El acento
 * reescribe `--brand*` al instante; `tint`/`ink` usan la variante del tema
 * activo (hsl / hslDark, ver lib/personalizacion/acentos.ts) porque los
 * lavados e inks del tema claro no contrastan sobre carbón.
 */
export function ThemeEffect() {
  const { tema, acento } = useConfig();
  const esOscuro = tema === "oscuro";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", esOscuro);
  }, [esOscuro]);

  useEffect(() => {
    const def = acentoPorId(acento);
    const root = document.documentElement.style;
    root.setProperty("--brand", def.hsl.default);
    root.setProperty("--brand-tint", esOscuro ? def.hslDark.tint : def.hsl.tint);
    root.setProperty("--brand-ink", esOscuro ? def.hslDark.ink : def.hsl.ink);
  }, [acento, esOscuro]);

  return null;
}
