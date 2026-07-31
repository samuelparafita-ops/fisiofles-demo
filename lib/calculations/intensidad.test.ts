import { describe, expect, it } from "vitest";
import { intensidadSesion } from "./intensidad";

const UMBRALES = { rpeLow: 6, rpeHigh: 8 };

describe("intensidadSesion", () => {
  it("low si rpe <= rpeLow", () => {
    expect(intensidadSesion(4, UMBRALES)).toBe("low");
    expect(intensidadSesion(6, UMBRALES)).toBe("low");
  });

  it("moderate entre rpeLow (exclusivo) y rpeHigh (inclusivo)", () => {
    expect(intensidadSesion(6.5, UMBRALES)).toBe("moderate");
    expect(intensidadSesion(7, UMBRALES)).toBe("moderate");
    expect(intensidadSesion(8, UMBRALES)).toBe("moderate");
  });

  it("high si rpe > rpeHigh", () => {
    expect(intensidadSesion(8.5, UMBRALES)).toBe("high");
    expect(intensidadSesion(10, UMBRALES)).toBe("high");
  });
});
