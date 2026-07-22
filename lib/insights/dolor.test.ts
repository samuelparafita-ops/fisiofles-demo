import { describe, expect, it } from "vitest";
import { hallazgosDolor } from "./dolor";
import { atletaFixture, UMBRALES_FIXTURE } from "./test-helpers";

function evolucion(dolor: number) {
  return [{ fecha: "2026-07-20", dolor, carga: 500, rpe: 6 }];
}

describe("hallazgosDolor", () => {
  it("sin hallazgos si no hay registros de evolución", () => {
    const atleta = atletaFixture({ evolucion: [] });
    expect(hallazgosDolor(atleta, UMBRALES_FIXTURE)).toEqual([]);
  });

  it("sin hallazgos si el dolor está por debajo del umbral", () => {
    const atleta = atletaFixture({ evolucion: evolucion(4) });
    expect(hallazgosDolor(atleta, UMBRALES_FIXTURE)).toEqual([]);
  });

  it("hallazgo de atención si el dolor iguala el umbral", () => {
    const atleta = atletaFixture({ evolucion: evolucion(5) });
    const hallazgos = hallazgosDolor(atleta, UMBRALES_FIXTURE);
    expect(hallazgos).toHaveLength(1);
    expect(hallazgos[0].severidad).toBe("atencion");
  });

  it("hallazgo crítico si el dolor supera el umbral en 2 o más puntos", () => {
    const atleta = atletaFixture({ evolucion: evolucion(7) });
    const hallazgos = hallazgosDolor(atleta, UMBRALES_FIXTURE);
    expect(hallazgos[0].severidad).toBe("critico");
  });
});
