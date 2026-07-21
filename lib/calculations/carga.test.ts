import { describe, expect, it } from "vitest";
import { cargaInterna, cargaExterna } from "./carga";

describe("cargaInterna (sRPE)", () => {
  it("suma rpe × duración de cada sesión", () => {
    const sesiones = [
      { rpe: 6, duracionMin: 60 },
      { rpe: 7, duracionMin: 45 },
    ];
    expect(cargaInterna(sesiones)).toBe(6 * 60 + 7 * 45);
  });

  it("0 si no hay sesiones", () => {
    expect(cargaInterna([])).toBe(0);
  });
});

describe("cargaExterna", () => {
  it("volumen × intensidad", () => {
    expect(cargaExterna(500, 1.6)).toBe(800);
  });
});
