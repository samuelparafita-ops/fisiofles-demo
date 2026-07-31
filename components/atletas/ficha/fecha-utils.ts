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

export const DIAS_CORTOS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const;

/** Lunes de la semana que contiene `d` (semana ISO, lunes-domingo). */
export function inicioSemana(d: Date): Date {
  const copia = new Date(d);
  copia.setHours(0, 0, 0, 0);
  const dia = copia.getDay();
  const diff = dia === 0 ? -6 : 1 - dia;
  copia.setDate(copia.getDate() + diff);
  return copia;
}

export function fmtFechaCorta(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

export function fmtFechaLarga(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** Días entre hoy y `fechaIso` (negativo si `fechaIso` ya pasó). */
export function diasHasta(fechaIso: string): number {
  const hoy = new Date(`${hoyIso()}T00:00:00`);
  const fecha = new Date(`${fechaIso}T00:00:00`);
  return Math.round((fecha.getTime() - hoy.getTime()) / 86400000);
}

/** Edad en años cumplidos a partir de una fecha de nacimiento ISO. */
export function edadDesde(fechaNacimientoIso: string): number {
  const nacimiento = new Date(`${fechaNacimientoIso}T00:00:00`);
  const hoy = new Date();
  const edad = hoy.getFullYear() - nacimiento.getFullYear();
  const noCumplidaAun =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());
  return noCumplidaAun ? edad - 1 : edad;
}
