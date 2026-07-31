/**
 * Semáforo de fases de un proceso de lesión — continuum rojo → verde
 * fosforito interpolado en espacio HSL (por RGB lineal el tramo medio se
 * ensucia en marrones). Fase 0 = más temprana/roja; fase `total-1` = más
 * avanzada/verde. `total=1` (procesos de una sola fase, p.ej. "Rendimiento")
 * pinta siempre verde fosforito: no hay una "fase inicial" que representar.
 *
 * Los dos hex extremos viven en `lib/tokens.ts` (`colors.semaforo.*`) — nadie
 * más los importa directamente.
 */

import { colors } from "@/lib/tokens";

type Rgb = { r: number; g: number; b: number };
type Hsl = { h: number; s: number; l: number };

function hexARgb(hex: string): Rgb {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbAHsl({ r, g, b }: Rgb): Hsl {
  const rN = r / 255;
  const gN = g / 255;
  const bN = b / 255;
  const max = Math.max(rN, gN, bN);
  const min = Math.min(rN, gN, bN);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };

  const d = max - min;
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === rN) h = 60 * (((gN - bN) / d) % 6);
  else if (max === gN) h = 60 * ((bN - rN) / d + 2);
  else h = 60 * ((rN - gN) / d + 4);
  if (h < 0) h += 360;

  return { h, s, l };
}

function hslARgb({ h, s, l }: Hsl): Rgb {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let rP = 0;
  let gP = 0;
  let bP = 0;
  if (h < 60) [rP, gP, bP] = [c, x, 0];
  else if (h < 120) [rP, gP, bP] = [x, c, 0];
  else if (h < 180) [rP, gP, bP] = [0, c, x];
  else if (h < 240) [rP, gP, bP] = [0, x, c];
  else if (h < 300) [rP, gP, bP] = [x, 0, c];
  else [rP, gP, bP] = [c, 0, x];

  return {
    r: Math.round((rP + m) * 255),
    g: Math.round((gP + m) * 255),
    b: Math.round((bP + m) * 255),
  };
}

function rgbAHex({ r, g, b }: Rgb): string {
  const canal = (v: number) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0");
  return `#${canal(r)}${canal(g)}${canal(b)}`.toUpperCase();
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

const HSL_INICIO = rgbAHsl(hexARgb(colors.semaforo.inicio));
const HSL_FIN = rgbAHsl(hexARgb(colors.semaforo.fin));

function hslEnFase(indice: number, total: number): Hsl {
  if (total <= 1) return HSL_FIN;
  const t = Math.min(1, Math.max(0, indice / (total - 1)));
  return {
    h: lerp(HSL_INICIO.h, HSL_FIN.h, t),
    s: lerp(HSL_INICIO.s, HSL_FIN.s, t),
    l: lerp(HSL_INICIO.l, HSL_FIN.l, t),
  };
}

/** Color de la fase `indice` (0-based) de un proceso de `total` fases. */
export function colorSemaforo(indice: number, total: number): string {
  return rgbAHex(hslARgb(hslEnFase(indice, total)));
}

/**
 * Color de TEXTO legible (oscurecido) para pintar el semáforo sobre fondo
 * claro — mismo criterio que `brandInk` frente a `brand` (ver lib/tokens.ts):
 * mismo tono/saturación, luminosidad recortada para que contraste en blanco.
 */
export function colorSemaforoTexto(indice: number, total: number): string {
  const hsl = hslEnFase(indice, total);
  return rgbAHex(hslARgb({ ...hsl, l: Math.min(hsl.l, 0.38) }));
}
