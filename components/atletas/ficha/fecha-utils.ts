import type { DiaSemana } from "@/lib/store";

const NOMBRES_DIA: readonly DiaSemana[] = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

/** Mismo mapeo que `lib/mock/seed.ts` — getDay() 0=domingo. */
export function diaSemanaDeIso(fechaIso: string): DiaSemana {
  const d = new Date(`${fechaIso}T00:00:00`);
  return NOMBRES_DIA[d.getDay()];
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function toIso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function hoyIso(): string {
  return toIso(new Date());
}

export function addDias(base: Date, dias: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + dias);
  return d;
}

export function fmtFechaCorta(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

export function fmtFechaLarga(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
