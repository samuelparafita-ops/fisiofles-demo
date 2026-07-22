/**
 * Series semanales agregadas para /dashboard (FASE E): comparan la
 * plantilla activa entera (serie agregada) con hasta 4 atletas superpuestos.
 * Funciones PURAS (mismo estándar que lib/calculations/ y lib/insights/),
 * sin React ni estado — ver CLAUDE.md > Motor de cálculo.
 *
 * Dos formas de alinear "semana" según qué dato hay disponible:
 * - Carga/ACWR: `Atleta.acwr` no tiene fecha real, solo una posición relativa
 *   ("semana N" de CADA atleta, que no coincide entre atletas). Se alinea por
 *   "posiciones hacia atrás desde la más reciente" — mismo truco que
 *   `ActividadPlantillaChart` en Inicio.
 * - Simetría/Dolor/Sesiones: sí hay fecha ISO real (RegistroTest.fecha,
 *   Atleta.evolucion[].fecha, Sesion.fecha), así que se alinean por semana de
 *   calendario real (hoy − 7·offset días).
 */

import { acwr, cargaCronica, zonaAcwr, type UmbralesAcwr } from "@/lib/calculations";
import { puntosSimetria } from "@/lib/insights";
import type { RegistroTest, Sesion, TestDef } from "@/lib/store";

export type PuntoSerie = {
  semana: string;
  agregado: number | null;
  porAtleta: Record<string, number | null>;
};

type AtletaConAcwr = { id: string; acwr: { agudo: number }[] };
type AtletaConEvolucion = { id: string; evolucion: { fecha: string; dolor: number }[] };
type AtletaConId = { id: string };

// ---------------------------------------------------------------------------
// Helpers de fecha (mismo patrón local que lib/store/aplicar-plantilla.ts y
// lib/mock/seed.ts — no se comparte un util cross-cutting para esto en el repo).
// ---------------------------------------------------------------------------

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function toIso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function restarDias(base: Date, dias: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() - dias);
  return d;
}

export type SemanaRef = { offset: number; label: string; fecha: string };

/** `n` semanas de referencia, de la más antigua a "Actual" (offset 0 = hoy). */
export function semanasOffset(hoy: Date, n: number): SemanaRef[] {
  const semanas: SemanaRef[] = [];
  for (let offset = n - 1; offset >= 0; offset--) {
    semanas.push({
      offset,
      label: offset === 0 ? "Actual" : `Hace ${offset} sem.`,
      fecha: toIso(restarDias(hoy, offset * 7)),
    });
  }
  return semanas;
}

/** Media ignorando `null`/`undefined`; `null` si no queda ningún valor válido. */
export function promedio(valores: (number | null | undefined)[]): number | null {
  const validos = valores.filter((v): v is number => v !== null && v !== undefined);
  if (validos.length === 0) return null;
  return validos.reduce((a, b) => a + b, 0) / validos.length;
}

export type PuntoFecha = { fecha: string; valor: number };

/**
 * Interpola linealmente el valor en `fechaObjetivo` a partir de una serie de
 * puntos (fecha ISO, valor) de UN atleta. No extrapola hacia atrás: una fecha
 * anterior al primer punto conocido da `null` (no se inventa un valor
 * pre-baseline, p. ej. un atleta recién llegado sin tests todavía). Una fecha
 * posterior al último punto conocido arrastra ese último valor (más útil en
 * un gráfico que dejar un hueco solo porque no ha habido un test más
 * reciente).
 */
export function interpolarEnFecha(puntos: PuntoFecha[], fechaObjetivo: string): number | null {
  if (puntos.length === 0) return null;
  const ordenados = [...puntos].sort((a, b) => a.fecha.localeCompare(b.fecha));

  const primero = ordenados[0];
  if (fechaObjetivo <= primero.fecha) {
    return fechaObjetivo === primero.fecha ? primero.valor : null;
  }

  const ultimo = ordenados[ordenados.length - 1];
  if (fechaObjetivo >= ultimo.fecha) return ultimo.valor;

  for (let i = 0; i < ordenados.length - 1; i++) {
    const a = ordenados[i];
    const b = ordenados[i + 1];
    if (fechaObjetivo >= a.fecha && fechaObjetivo <= b.fecha) {
      if (a.fecha === b.fecha) return a.valor;
      const tA = new Date(`${a.fecha}T00:00:00`).getTime();
      const tB = new Date(`${b.fecha}T00:00:00`).getTime();
      const tX = new Date(`${fechaObjetivo}T00:00:00`).getTime();
      const frac = (tX - tA) / (tB - tA);
      return a.valor + (b.valor - a.valor) * frac;
    }
  }
  return ultimo.valor;
}

// ---------------------------------------------------------------------------
// Carga semanal (sRPE) — agregado = SUMA.
// ---------------------------------------------------------------------------

export function serieCargaSemanal(
  atletas: AtletaConAcwr[],
  semanas: number,
  hoy: Date = new Date()
): PuntoSerie[] {
  return semanasOffset(hoy, semanas).map(({ offset, label }) => {
    const porAtleta: Record<string, number | null> = {};
    for (const atleta of atletas) {
      const agudos = atleta.acwr.map((c) => c.agudo);
      const idx = agudos.length - 1 - offset;
      porAtleta[atleta.id] = idx >= 0 ? agudos[idx] : null;
    }
    const validos = Object.values(porAtleta).filter((v): v is number => v !== null);
    return { semana: label, agregado: validos.length > 0 ? validos.reduce((a, b) => a + b, 0) : null, porAtleta };
  });
}

// ---------------------------------------------------------------------------
// ACWR — agregado = MEDIA del ratio por atleta (no el ratio de la carga total).
// ---------------------------------------------------------------------------

export function serieAcwr(
  atletas: AtletaConAcwr[],
  semanas: number,
  hoy: Date = new Date()
): PuntoSerie[] {
  return semanasOffset(hoy, semanas).map(({ offset, label }) => {
    const porAtleta: Record<string, number | null> = {};
    for (const atleta of atletas) {
      const agudos = atleta.acwr.map((c) => c.agudo);
      const idx = agudos.length - 1 - offset;
      porAtleta[atleta.id] = idx >= 0 ? acwr(agudos[idx], cargaCronica(agudos, idx)) : null;
    }
    return { semana: label, agregado: promedio(Object.values(porAtleta)), porAtleta };
  });
}

/** Snapshot actual (última semana registrada de cada atleta) para la StatCard "en zona óptima". */
export function resumenZonaOptimaAcwr(
  atletas: AtletaConAcwr[],
  umbrales: UmbralesAcwr
): { enOptima: number; total: number } {
  let enOptima = 0;
  for (const atleta of atletas) {
    const agudos = atleta.acwr.map((c) => c.agudo);
    const idx = agudos.length - 1;
    if (idx < 0) continue;
    const ratio = acwr(agudos[idx], cargaCronica(agudos, idx));
    if (ratio !== null && zonaAcwr(ratio, umbrales) === "optima") enOptima += 1;
  }
  return { enOptima, total: atletas.length };
}

// ---------------------------------------------------------------------------
// Simetría media — interpolada entre los RegistroTest unilateral-lsi de cada
// atleta (se agrupan TODOS sus tests unilaterales en una única serie temporal
// por atleta: es una media general de "cómo de simétrico está", no el
// detalle por test que ya muestra SimetriaBar en la ficha). Agregado = MEDIA.
// ---------------------------------------------------------------------------

export function serieSimetriaMedia(
  atletas: AtletaConId[],
  registrosTests: RegistroTest[],
  catalogo: TestDef[],
  semanas: number,
  hoy: Date = new Date()
): PuntoSerie[] {
  const puntosPorAtleta = new Map<string, PuntoFecha[]>();
  for (const atleta of atletas) {
    const registrosAtleta = registrosTests.filter((r) => r.atletaId === atleta.id);
    const puntos = puntosSimetria(registrosAtleta, catalogo).map((p) => ({ fecha: p.fecha, valor: p.pct }));
    puntosPorAtleta.set(atleta.id, puntos);
  }

  return semanasOffset(hoy, semanas).map(({ label, fecha }) => {
    const porAtleta: Record<string, number | null> = {};
    for (const atleta of atletas) {
      porAtleta[atleta.id] = interpolarEnFecha(puntosPorAtleta.get(atleta.id) ?? [], fecha);
    }
    return { semana: label, agregado: promedio(Object.values(porAtleta)), porAtleta };
  });
}

// ---------------------------------------------------------------------------
// Dolor medio — interpolado entre los puntos de `Atleta.evolucion`. Agregado = MEDIA.
// ---------------------------------------------------------------------------

export function serieDolorMedio(
  atletas: AtletaConEvolucion[],
  semanas: number,
  hoy: Date = new Date()
): PuntoSerie[] {
  const puntosPorAtleta = new Map<string, PuntoFecha[]>();
  for (const atleta of atletas) {
    puntosPorAtleta.set(
      atleta.id,
      atleta.evolucion.map((e) => ({ fecha: e.fecha, valor: e.dolor }))
    );
  }

  return semanasOffset(hoy, semanas).map(({ label, fecha }) => {
    const porAtleta: Record<string, number | null> = {};
    for (const atleta of atletas) {
      porAtleta[atleta.id] = interpolarEnFecha(puntosPorAtleta.get(atleta.id) ?? [], fecha);
    }
    return { semana: label, agregado: promedio(Object.values(porAtleta)), porAtleta };
  });
}

// ---------------------------------------------------------------------------
// Sesiones completadas/semana — conteo real por ventana de 7 días (no
// interpolado: es un recuento, no una medición continua). Agregado = SUMA.
// ---------------------------------------------------------------------------

export function serieSesionesCompletadas(
  atletas: AtletaConId[],
  sesiones: Sesion[],
  semanas: number,
  hoy: Date = new Date()
): PuntoSerie[] {
  const idsValidos = new Set(atletas.map((a) => a.id));

  return semanasOffset(hoy, semanas).map(({ label, fecha }) => {
    const inicioIso = toIso(restarDias(new Date(`${fecha}T00:00:00`), 6));
    const porAtleta: Record<string, number> = {};
    for (const atleta of atletas) porAtleta[atleta.id] = 0;

    for (const s of sesiones) {
      if (s.estado !== "completada") continue;
      if (!idsValidos.has(s.atletaId)) continue;
      if (s.fecha < inicioIso || s.fecha > fecha) continue;
      porAtleta[s.atletaId] += 1;
    }

    const agregado = Object.values(porAtleta).reduce((a: number, b: number) => a + b, 0);
    return { semana: label, agregado, porAtleta };
  });
}
