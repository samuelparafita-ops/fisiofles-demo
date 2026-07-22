import { describe, expect, it } from "vitest";
import type { FormularioEnvio } from "@/lib/store/types";
import { hallazgosFormularios } from "./formularios";

const AHORA = new Date("2026-07-22T12:00:00");

function envio(overrides: Partial<FormularioEnvio>): FormularioEnvio {
  return {
    id: "envio-1",
    formularioId: "form-1",
    atletaId: "atleta-1",
    fechaEnvio: "2026-07-22",
    estado: "pendiente",
    ...overrides,
  };
}

describe("hallazgosFormularios", () => {
  it("sin hallazgos si está respondido", () => {
    const envios = [envio({ estado: "respondido", fechaEnvio: "2026-07-01" })];
    expect(hallazgosFormularios(envios, AHORA)).toEqual([]);
  });

  it("sin hallazgos si pendiente pero enviado hace menos de 48h", () => {
    const envios = [envio({ fechaEnvio: "2026-07-21" })]; // ~36h antes de las 12:00
    expect(hallazgosFormularios(envios, AHORA)).toEqual([]);
  });

  it("hallazgo si pendiente y enviado hace más de 48h", () => {
    const envios = [envio({ fechaEnvio: "2026-07-18" })];
    const hallazgos = hallazgosFormularios(envios, AHORA);
    expect(hallazgos).toHaveLength(1);
    expect(hallazgos[0].atletaId).toBe("atleta-1");
  });
});
