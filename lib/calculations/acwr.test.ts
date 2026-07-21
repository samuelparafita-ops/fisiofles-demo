import { describe, expect, it } from "vitest";
import { cargaCronica, acwr, zonaAcwr } from "./acwr";

describe("cargaCronica", () => {
  it("null si hay menos de 4 semanas previas", () => {
    expect(cargaCronica([900, 800, 850], 3)).toBeNull();
  });

  it("media móvil de las 4 semanas previas: [900,800,850,900] → 862.5", () => {
    const cargasAgudas = [900, 800, 850, 900, 1100];
    expect(cargaCronica(cargasAgudas, 4)).toBe(862.5);
  });
});

describe("acwr", () => {
  it("aguda 1100 / crónica 862.5 ≈ 1.28 → zona óptima", () => {
    const ratio = acwr(1100, 862.5);
    expect(ratio).toBeCloseTo(1.28, 2);
    expect(zonaAcwr(ratio!)).toBe("optima");
  });

  it("null si la crónica es null o 0", () => {
    expect(acwr(1100, null)).toBeNull();
    expect(acwr(1100, 0)).toBeNull();
  });
});

describe("zonaAcwr", () => {
  it("< 0.8 → insuficiente", () => {
    expect(zonaAcwr(0.79)).toBe("insuficiente");
  });

  it("0.8 - 1.3 → optima", () => {
    expect(zonaAcwr(0.8)).toBe("optima");
    expect(zonaAcwr(1.3)).toBe("optima");
  });

  it("> 1.3 → riesgo", () => {
    expect(zonaAcwr(1.31)).toBe("riesgo");
  });
});
