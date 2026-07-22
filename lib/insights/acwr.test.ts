import { describe, expect, it } from "vitest";
import { hallazgosAcwr, hallazgosRachaAcwr } from "./acwr";
import { atletaFixture, UMBRALES_FIXTURE } from "./test-helpers";

function semanas(agudos: number[]) {
  return agudos.map((agudo, i) => ({ semana: `S${i + 1}`, agudo }));
}

describe("hallazgosAcwr", () => {
  it("sin hallazgos si no hay suficientes semanas para calcular ratio", () => {
    const atleta = atletaFixture({ acwr: semanas([500, 520, 510]) });
    expect(hallazgosAcwr(atleta, UMBRALES_FIXTURE)).toEqual([]);
  });

  it("sin hallazgos si el ratio está en zona óptima", () => {
    const atleta = atletaFixture({ acwr: semanas([500, 520, 510, 505, 510]) });
    expect(hallazgosAcwr(atleta, UMBRALES_FIXTURE)).toEqual([]);
  });

  it("hallazgo de riesgo si el ratio supera acwrAlto", () => {
    const atleta = atletaFixture({ acwr: semanas([500, 500, 500, 500, 900]) });
    const hallazgos = hallazgosAcwr(atleta, UMBRALES_FIXTURE);
    expect(hallazgos).toHaveLength(1);
    expect(hallazgos[0].titulo).toBe("ACWR en zona de riesgo");
    expect(hallazgos[0].detalle).toContain("1.80");
  });

  it("hallazgo de zona insuficiente si el ratio está por debajo de acwrBajo", () => {
    const atleta = atletaFixture({ acwr: semanas([500, 500, 500, 500, 100]) });
    const hallazgos = hallazgosAcwr(atleta, UMBRALES_FIXTURE);
    expect(hallazgos).toHaveLength(1);
    expect(hallazgos[0].titulo).toBe("ACWR en zona insuficiente");
  });

  it("banda exacta (ratio == acwrAlto) cuenta como óptima", () => {
    const atleta = atletaFixture({ acwr: semanas([500, 500, 500, 500, 650]) });
    expect(hallazgosAcwr(atleta, UMBRALES_FIXTURE)).toEqual([]);
  });
});

describe("hallazgosRachaAcwr", () => {
  it("sin hallazgos con menos de 3 ratios calculables", () => {
    const atleta = atletaFixture({ acwr: semanas([500, 500, 500, 500, 500]) });
    expect(hallazgosRachaAcwr(atleta, UMBRALES_FIXTURE)).toEqual([]);
  });

  it("racha info si las últimas 3 semanas están en zona óptima", () => {
    const atleta = atletaFixture({ acwr: semanas([500, 500, 500, 500, 510, 505, 500]) });
    const hallazgos = hallazgosRachaAcwr(atleta, UMBRALES_FIXTURE);
    expect(hallazgos).toHaveLength(1);
    expect(hallazgos[0].severidad).toBe("info");
  });

  it("sin racha si alguna de las últimas 3 semanas no es óptima", () => {
    const atleta = atletaFixture({ acwr: semanas([500, 500, 500, 500, 900, 505, 500]) });
    expect(hallazgosRachaAcwr(atleta, UMBRALES_FIXTURE)).toEqual([]);
  });
});
