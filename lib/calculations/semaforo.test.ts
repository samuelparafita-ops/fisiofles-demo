import { describe, expect, it } from "vitest";
import { colorSemaforo, colorSemaforoTexto } from "./semaforo";
import { colors } from "@/lib/tokens";

describe("colorSemaforo", () => {
  it("extremos exactos: fase 0 = inicio, última fase = fin", () => {
    expect(colorSemaforo(0, 5)).toBe(colors.semaforo.inicio);
    expect(colorSemaforo(4, 5)).toBe(colors.semaforo.fin);
  });

  it("total=1 pinta siempre verde fosforito (fin)", () => {
    expect(colorSemaforo(0, 1)).toBe(colors.semaforo.fin);
  });

  it("monotonía de tono: cada fase sucesiva es más 'verde' que la anterior", () => {
    const total = 7;
    const tonos = Array.from({ length: total }, (_, i) => hue(colorSemaforo(i, total)));
    for (let i = 1; i < tonos.length; i += 1) {
      expect(tonos[i]).toBeGreaterThan(tonos[i - 1]);
    }
  });

  it("6 fases: ningún color intermedio repite hex", () => {
    const colores = Array.from({ length: 6 }, (_, i) => colorSemaforo(i, 6));
    expect(new Set(colores).size).toBe(6);
  });
});

describe("colorSemaforoTexto", () => {
  it("es igual al color base cuando ya es suficientemente oscuro (fase inicial)", () => {
    expect(colorSemaforoTexto(0, 5)).toBe(colorSemaforo(0, 5));
  });

  it("oscurece las fases finales (más claras) respecto al color base", () => {
    const base = hue(colorSemaforo(4, 5));
    const texto = colorSemaforo(4, 5);
    expect(colorSemaforoTexto(4, 5)).not.toBe(texto);
    // Mismo tono, solo cambia la luminosidad.
    expect(hue(colorSemaforoTexto(4, 5))).toBeCloseTo(base, 0);
  });
});

/** Extrae el matiz (0-360) de un hex para comparar tonos entre fases. */
function hue(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return 0;
  let h: number;
  if (max === r) h = 60 * (((g - b) / d) % 6);
  else if (max === g) h = 60 * ((b - r) / d + 2);
  else h = 60 * ((r - g) / d + 4);
  return h < 0 ? h + 360 : h;
}
