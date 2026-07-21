import { describe, expect, it } from "vitest";
import { zScore, perfilRadar } from "./radar";

describe("zScore", () => {
  it("Fuerza explosiva ♂: valor 40 → z ≈ 0.40", () => {
    expect(zScore("Fuerza explosiva", 40, "Hombre")).toBeCloseTo(0.4, 2);
  });

  it("Fuerza explosiva ♂: valor 41 → z ≈ 0.686", () => {
    expect(zScore("Fuerza explosiva", 41, "Hombre")).toBeCloseTo(0.686, 3);
  });

  it("Altura salto CMJ ♂: valor 23.3 → z ≈ −3.85", () => {
    expect(zScore("Altura salto CMJ", 23.3, "Hombre")).toBeCloseTo(-3.85, 2);
  });

  it("Altura salto CMJ ♂: valor 37.7 → z ≈ −0.636", () => {
    expect(zScore("Altura salto CMJ", 37.7, "Hombre")).toBeCloseTo(-0.636, 3);
  });
});

describe("perfilRadar", () => {
  it("devuelve las 3 series (inicial, actual, base=0) en el orden de referencias", () => {
    const iniciales = { "Fuerza explosiva": 34.6, "Altura salto CMJ": 23.3 };
    const actuales = { "Fuerza explosiva": 41, "Altura salto CMJ": 37.7 };

    const perfil = perfilRadar(iniciales, actuales, "Hombre");

    expect(perfil).toEqual([
      { eje: "Fuerza explosiva", inicial: expect.closeTo(-1.143, 3), actual: expect.closeTo(0.686, 3), base: 0 },
      { eje: "Altura salto CMJ", inicial: expect.closeTo(-3.85, 2), actual: expect.closeTo(-0.636, 3), base: 0 },
    ]);
  });

  it("lanza si falta el valor actual para una capacidad presente en inicial", () => {
    expect(() =>
      perfilRadar({ "Fuerza explosiva": 40 }, {}, "Hombre")
    ).toThrow();
  });
});
