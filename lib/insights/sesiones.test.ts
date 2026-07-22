import { describe, expect, it } from "vitest";
import type { Sesion } from "@/lib/store/types";
import { hallazgosSesiones } from "./sesiones";
import { atletaFixture } from "./test-helpers";

const AHORA = new Date("2026-07-22T00:00:00");

function sesion(overrides: Partial<Sesion>): Sesion {
  return {
    id: "ses-1",
    atletaId: "atleta-1",
    fecha: "2026-07-23",
    dia: "Jueves",
    nombre: "Sesión",
    ejercicios: [],
    estado: "programada",
    ...overrides,
  };
}

describe("hallazgosSesiones", () => {
  it("sin hallazgos si el atleta no está activo", () => {
    const atleta = atletaFixture({ id: "atleta-1", estado: "alta" });
    expect(hallazgosSesiones(atleta, [], AHORA)).toEqual([]);
  });

  it("sin hallazgos si hay una sesión programada dentro de los próximos 7 días", () => {
    const atleta = atletaFixture({ id: "atleta-1" });
    const sesiones = [sesion({ fecha: "2026-07-25" })];
    expect(hallazgosSesiones(atleta, sesiones, AHORA)).toEqual([]);
  });

  it("hallazgo si no hay ninguna sesión en los próximos 7 días", () => {
    const atleta = atletaFixture({ id: "atleta-1" });
    const sesiones = [sesion({ fecha: "2026-08-15" })];
    const hallazgos = hallazgosSesiones(atleta, sesiones, AHORA);
    expect(hallazgos).toHaveLength(1);
  });

  it("no cuenta sesiones canceladas dentro de la ventana", () => {
    const atleta = atletaFixture({ id: "atleta-1" });
    const sesiones = [sesion({ fecha: "2026-07-24", estado: "cancelada" })];
    const hallazgos = hallazgosSesiones(atleta, sesiones, AHORA);
    expect(hallazgos).toHaveLength(1);
  });

  it("ignora sesiones de otros atletas", () => {
    const atleta = atletaFixture({ id: "atleta-1" });
    const sesiones = [sesion({ atletaId: "otro-atleta", fecha: "2026-07-24" })];
    const hallazgos = hallazgosSesiones(atleta, sesiones, AHORA);
    expect(hallazgos).toHaveLength(1);
  });
});
