import type { Atleta, UmbralesConfig } from "@/lib/store/types";
import type { Hallazgo } from "./tipos";

/** Regla 3: dolor del último registro de evolución >= `umbrales.dolorAlerta`. */
export function hallazgosDolor(atleta: Atleta, umbrales: UmbralesConfig): Hallazgo[] {
  const ultimo = atleta.evolucion[atleta.evolucion.length - 1];
  if (!ultimo) return [];
  if (ultimo.dolor < umbrales.dolorAlerta) return [];

  return [
    {
      id: `hallazgo-dolor-${atleta.id}`,
      atletaId: atleta.id,
      severidad: ultimo.dolor >= umbrales.dolorAlerta + 2 ? "critico" : "atencion",
      titulo: "Dolor elevado en el último registro",
      detalle: `El último registro de dolor es ${ultimo.dolor}/10, igual o por encima del umbral de alerta (${umbrales.dolorAlerta}).`,
      fecha: ultimo.fecha,
      enlace: `/atletas/${atleta.id}`,
    },
  ];
}
