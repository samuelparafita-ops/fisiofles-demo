import type { AppState } from "@/lib/store/types";
import { hallazgosAcwr, hallazgosRachaAcwr } from "./acwr";
import { hallazgosDolor } from "./dolor";
import { hallazgosFormularios } from "./formularios";
import { hallazgosSesiones } from "./sesiones";
import { hallazgosRachaSimetria, hallazgosSimetria } from "./simetria";
import type { Hallazgo } from "./tipos";

export * from "./tipos";
export * from "./acwr";
export * from "./simetria";
export * from "./dolor";
export * from "./formularios";
export * from "./sesiones";

export type GenerarHallazgosInput = {
  atletas: AppState["atletas"];
  sesiones: AppState["sesiones"];
  registrosTests: AppState["registrosTests"];
  catalogoTests: AppState["catalogoTests"];
  formulariosEnvios: AppState["formulariosEnvios"];
  config: AppState["config"];
  ahora?: Date;
};

/** Orquesta las 6 reglas del motor de hallazgos para todos los atletas. */
export function generarHallazgos(input: GenerarHallazgosInput): Hallazgo[] {
  const ahora = input.ahora ?? new Date();
  const hallazgos: Hallazgo[] = [];

  for (const atleta of input.atletas) {
    const registrosAtleta = input.registrosTests.filter((r) => r.atletaId === atleta.id);
    const enviosAtleta = input.formulariosEnvios.filter((f) => f.atletaId === atleta.id);

    hallazgos.push(
      ...hallazgosAcwr(atleta, input.config.umbrales),
      ...hallazgosSimetria(atleta.id, registrosAtleta, input.catalogoTests, input.config.umbrales),
      ...hallazgosDolor(atleta, input.config.umbrales),
      ...hallazgosFormularios(enviosAtleta, ahora),
      ...hallazgosSesiones(atleta, input.sesiones, ahora),
      ...hallazgosRachaAcwr(atleta, input.config.umbrales),
      ...hallazgosRachaSimetria(atleta.id, registrosAtleta, input.catalogoTests, input.config.umbrales)
    );
  }

  return hallazgos;
}
