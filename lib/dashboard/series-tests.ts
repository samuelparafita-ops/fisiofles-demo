/**
 * Series por test para el motor de gráficos v3 (FASE 3) — mismo estándar que
 * `lib/dashboard/series.ts`: funciones PURAS, sin React ni estado. Estas
 * alimentan `GraficoTest` (`components/charts/grafico-test.tsx`), que
 * reutilizarán idénticamente `/dashboard` y la ficha del atleta (FASE 4).
 *
 * Diferencia clave con `lib/dashboard/series.ts`: ahí el periodo es "N
 * semanas hacia atrás desde hoy" (`semanas: number, hoy: Date`); aquí es un
 * rango de fechas explícito (`desde`/`hasta`), porque la FASE 4 añade
 * selector de rango personalizado con calendario. `rangoDesdeSemanas()` es el
 * puente de compatibilidad con el rango legado (4/8/12 semanas).
 */

import { simetria } from "@/lib/calculations";
import type {
  Atleta,
  RegistroTest,
  TestDef,
  ValorCuestionario,
  ValorUnico,
  ValorUnilateral,
} from "@/lib/store/types";
import { interpolarEnFecha, promedio, type PuntoFecha, type PuntoSerie } from "./series";

// ---------------------------------------------------------------------------
// Helpers de fecha — mismo patrón local que lib/dashboard/series.ts (no se
// comparte un util cross-cutting para esto en el repo, ver su cabecera).
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

function fmtSemanaLabel(fechaIso: string): string {
  const [, m, d] = fechaIso.split("-");
  return `${d}/${m}`;
}

/**
 * Fechas ISO semanales entre `desde` y `hasta`, en pasos de 7 días. El último
 * punto SIEMPRE cae en `hasta` (ancla por el extremo más reciente, igual que
 * `semanasOffset` ancla en "hoy"); si el rango no es múltiplo de 7, el punto
 * más antiguo puede caer unos días después de `desde` en vez de coincidir.
 */
export function semanasEnRango(desde: Date, hasta: Date): string[] {
  const fechas: string[] = [];
  let cursor = new Date(hasta);
  while (cursor >= desde) {
    fechas.unshift(toIso(cursor));
    cursor = restarDias(cursor, 7);
  }
  if (fechas.length === 0) fechas.push(toIso(hasta));
  return fechas;
}

/** Puente de compatibilidad con el rango legado (4/8/12 semanas de `lib/dashboard/metricas.ts`). */
export function rangoDesdeSemanas(semanas: number, hoy: Date = new Date()): { desde: Date; hasta: Date } {
  return { desde: restarDias(hoy, (semanas - 1) * 7), hasta: hoy };
}

// ---------------------------------------------------------------------------
// Lectura de un valor de test — misma regla en toda la función:
// - `cuestionario-pro`: el único campo `puntuacion`.
// - `unilateral-lsi`: la variable BASE (izq/der) solo tiene una entrada real
//   en `registro.valores`; el LSI nunca se guarda (ver `lib/store/simetrias.ts`).
//   Pedir la variable LSI calcula `simetria(izq, der)`. Pedir la variable base
//   en sí — un par, no un número — devuelve `max(izq, der)` (el lado fuerte,
//   supuesto documentado: no hay un "valor único" natural para un par
//   bilateral fuera del propio LSI).
// - `valor-unico`: lectura directa por variableId.
// ---------------------------------------------------------------------------

function esVariableLsi(test: TestDef, variableId: string): boolean {
  const v = test.variables.find((variable) => variable.id === variableId);
  return v?.nombre === "LSI" && v?.unidad === "%";
}

function variableBaseDeUnilateral(test: TestDef) {
  return test.variables.find((v) => !(v.nombre === "LSI" && v.unidad === "%"));
}

function valorDeRegistro(test: TestDef, registro: RegistroTest, variableId: string): number | null {
  if (test.tipo === "cuestionario-pro") {
    return (registro.valores as ValorCuestionario).puntuacion;
  }

  if (test.tipo === "unilateral-lsi") {
    const base = variableBaseDeUnilateral(test);
    if (!base) return null;
    const par = (registro.valores as ValorUnilateral)[base.id];
    if (!par) return null;
    return esVariableLsi(test, variableId) ? simetria(par.izq, par.der) : Math.max(par.izq, par.der);
  }

  const valores = registro.valores as ValorUnico;
  return valores[variableId] ?? null;
}

/** Puntos {fecha, valor} de UN atleta para un test+variable, ordenados cronológicamente, sin nulos. */
function puntosDeAtleta(
  registros: RegistroTest[],
  test: TestDef,
  variableId: string,
  atletaId: string
): PuntoFecha[] {
  return registros
    .filter((r) => r.atletaId === atletaId && r.testId === test.id)
    .map((r) => ({ fecha: r.fecha, valor: valorDeRegistro(test, r, variableId) }))
    .filter((p): p is PuntoFecha => p.valor !== null)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

// ---------------------------------------------------------------------------
// serieTest — serie semanal (agregado del conjunto + por atleta), interpolada
// entre los registros reales de cada atleta (mismo mecanismo que
// `serieSimetriaMedia`/`serieDolorMedio` de lib/dashboard/series.ts).
// ---------------------------------------------------------------------------

export function serieTest(
  registros: RegistroTest[],
  test: TestDef,
  variableId: string,
  atletas: Atleta[],
  desde: Date,
  hasta: Date
): PuntoSerie[] {
  const puntosPorAtleta = new Map<string, PuntoFecha[]>();
  for (const atleta of atletas) {
    puntosPorAtleta.set(atleta.id, puntosDeAtleta(registros, test, variableId, atleta.id));
  }

  return semanasEnRango(desde, hasta).map((fecha) => {
    const porAtleta: Record<string, number | null> = {};
    for (const atleta of atletas) {
      porAtleta[atleta.id] = interpolarEnFecha(puntosPorAtleta.get(atleta.id) ?? [], fecha);
    }
    return { semana: fmtSemanaLabel(fecha), agregado: promedio(Object.values(porAtleta)), porAtleta };
  });
}

// ---------------------------------------------------------------------------
// ultimoValorPorAtleta — snapshot para barras comparativas y para la
// dispersión F-V. `null` (no `0`) cuando el atleta no tiene registros de ese
// test hasta la fecha `hasta`.
// ---------------------------------------------------------------------------

export function ultimoValorPorAtleta(
  registros: RegistroTest[],
  test: TestDef,
  variableId: string,
  atletas: Atleta[],
  hasta?: Date
): { atletaId: string; valor: number | null; fecha: string | null }[] {
  const limiteIso = hasta ? toIso(hasta) : null;

  return atletas.map((atleta) => {
    const puntos = puntosDeAtleta(registros, test, variableId, atleta.id).filter(
      (p) => limiteIso === null || p.fecha <= limiteIso
    );
    const ultimo = puntos[puntos.length - 1];
    return ultimo
      ? { atletaId: atleta.id, valor: ultimo.valor, fecha: ultimo.fecha }
      : { atletaId: atleta.id, valor: null, fecha: null };
  });
}

/** Mediana — usada por `DispersionCuadrante` para las líneas de referencia X/Y. */
export function mediana(valores: number[]): number {
  if (valores.length === 0) return 0;
  const ordenados = [...valores].sort((a, b) => a - b);
  const mitad = Math.floor(ordenados.length / 2);
  return ordenados.length % 2 === 0 ? (ordenados[mitad - 1] + ordenados[mitad]) / 2 : ordenados[mitad];
}

// ---------------------------------------------------------------------------
// puntosCuadranteFV — cuadrante fuerza-velocidad (docs/Fisiofles_Formulas_Dashboard.md
// no lo cubre: es un gráfico nuevo v3 basado en dos tests fijos del catálogo
// real, IMTP y Velocidad máxima — ver brief FASE 3). Solo incluye atletas con
// AMBOS valores disponibles: un punto necesita los dos ejes.
// ---------------------------------------------------------------------------

export function puntosCuadranteFV(
  registros: RegistroTest[],
  catalogo: TestDef[],
  atletas: Atleta[],
  hasta?: Date
): { atletaId: string; x: number; y: number }[] {
  const imtp = catalogo.find((t) => t.id === "imtp");
  const velocidad = catalogo.find((t) => t.id === "velocidad-maxima");
  const fuerzaVar = imtp?.variables.find((v) => v.id === "fuerza-relativa");
  const vmaxVar = velocidad?.variables.find((v) => v.id === "vmax");
  if (!imtp || !velocidad || !fuerzaVar || !vmaxVar) return [];

  const xPorAtleta = ultimoValorPorAtleta(registros, imtp, fuerzaVar.id, atletas, hasta);
  const yPorAtleta = ultimoValorPorAtleta(registros, velocidad, vmaxVar.id, atletas, hasta);

  const puntos: { atletaId: string; x: number; y: number }[] = [];
  atletas.forEach((atleta, i) => {
    const x = xPorAtleta[i].valor;
    const y = yPorAtleta[i].valor;
    if (x !== null && y !== null) puntos.push({ atletaId: atleta.id, x, y });
  });
  return puntos;
}
