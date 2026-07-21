import { describe, expect, it } from "vitest";
import { simetria, estadoSimetria } from "./simetria";

describe("simetria", () => {
  it("30/35 = 85.71", () => {
    expect(simetria(30, 35)).toBeCloseTo(85.71, 2);
  });

  it("50/60 = 83.33", () => {
    expect(simetria(50, 60)).toBeCloseTo(83.33, 2);
  });

  it("es simétrica respecto al orden de los argumentos", () => {
    expect(simetria(35, 30)).toBeCloseTo(simetria(30, 35), 10);
  });

  it("devuelve 0 si ambos valores son 0", () => {
    expect(simetria(0, 0)).toBe(0);
  });
});

describe("estadoSimetria", () => {
  it("< 85 → deficit", () => {
    expect(estadoSimetria(84.9)).toBe("deficit");
  });

  it("85 - 89.9 → aceptable", () => {
    expect(estadoSimetria(85)).toBe("aceptable");
    expect(estadoSimetria(89.9)).toBe("aceptable");
  });

  it(">= 90 → optimo", () => {
    expect(estadoSimetria(90)).toBe("optimo");
  });
});
