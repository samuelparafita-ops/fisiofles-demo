import { describe, expect, it } from "vitest";
import type { RegistroTest } from "@/lib/store/types";
import { hallazgosRachaSimetria, hallazgosSimetria } from "./simetria";
import { CATALOGO_FIXTURE, UMBRALES_FIXTURE } from "./test-helpers";

function registro(fecha: string, izq: number, der: number): RegistroTest {
  return {
    id: `reg-${fecha}`,
    atletaId: "atleta-1",
    testId: "sl-cmj",
    fecha,
    valores: { altura: { izq, der } },
  };
}

describe("hallazgosSimetria", () => {
  it("sin hallazgos si la simetría está por encima del umbral y sin caída", () => {
    const registros = [registro("2026-01-01", 20, 21), registro("2026-01-15", 21, 21.5)];
    expect(hallazgosSimetria("atleta-1", registros, CATALOGO_FIXTURE, UMBRALES_FIXTURE)).toEqual([]);
  });

  it("hallazgo de déficit si la última medición está por debajo del umbral aceptable", () => {
    const registros = [registro("2026-01-01", 12, 20)]; // 60%
    const hallazgos = hallazgosSimetria("atleta-1", registros, CATALOGO_FIXTURE, UMBRALES_FIXTURE);
    expect(hallazgos.some((h) => h.titulo === "Déficit de simetría")).toBe(true);
  });

  it("hallazgo de caída si baja más de 5 puntos entre las dos últimas fechas", () => {
    const registros = [registro("2026-01-01", 19, 20), registro("2026-01-15", 15, 20)]; // 95% -> 75%
    const hallazgos = hallazgosSimetria("atleta-1", registros, CATALOGO_FIXTURE, UMBRALES_FIXTURE);
    expect(hallazgos.some((h) => h.titulo === "Caída de simetría entre mediciones")).toBe(true);
  });

  it("no dispara caída si la diferencia es de 5 puntos exactos o menos", () => {
    const registros = [registro("2026-01-01", 19, 20), registro("2026-01-15", 18.05, 20)];
    const hallazgos = hallazgosSimetria("atleta-1", registros, CATALOGO_FIXTURE, UMBRALES_FIXTURE);
    expect(hallazgos.some((h) => h.titulo === "Caída de simetría entre mediciones")).toBe(false);
  });

  it("ignora tests que no son unilateral-lsi", () => {
    const registros: RegistroTest[] = [
      { id: "r1", atletaId: "atleta-1", testId: "otro-test", fecha: "2026-01-01", valores: { x: 10 } },
    ];
    expect(hallazgosSimetria("atleta-1", registros, CATALOGO_FIXTURE, UMBRALES_FIXTURE)).toEqual([]);
  });
});

describe("hallazgosRachaSimetria", () => {
  it("racha info si la simetría cruza el objetivo al alza", () => {
    const registros = [registro("2026-01-01", 16, 20), registro("2026-01-15", 19, 20)]; // 80% -> 95%
    const hallazgos = hallazgosRachaSimetria("atleta-1", registros, CATALOGO_FIXTURE, UMBRALES_FIXTURE);
    expect(hallazgos).toHaveLength(1);
    expect(hallazgos[0].severidad).toBe("info");
  });

  it("sin racha si ya estaba por encima del objetivo antes", () => {
    const registros = [registro("2026-01-01", 19, 20), registro("2026-01-15", 19.5, 20)];
    expect(hallazgosRachaSimetria("atleta-1", registros, CATALOGO_FIXTURE, UMBRALES_FIXTURE)).toEqual([]);
  });

  it("sin racha con una sola medición", () => {
    const registros = [registro("2026-01-01", 19, 20)];
    expect(hallazgosRachaSimetria("atleta-1", registros, CATALOGO_FIXTURE, UMBRALES_FIXTURE)).toEqual([]);
  });
});
