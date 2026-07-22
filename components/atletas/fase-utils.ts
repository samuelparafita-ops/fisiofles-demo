/**
 * `Atleta.fase` es texto libre (ej. "Fase 3 · Readaptación al campo"), no un
 * enum — pero listas/filtros/selects necesitan agrupar por la fase "base".
 */

export const FASE_OPCIONES = ["Fase 1", "Fase 2", "Fase 3", "Fase 4", "Alta"] as const;

/** "Fase 3 · Readaptación al campo" → "Fase 3". Si no hay separador, devuelve tal cual. */
export function fasePrefijo(fase: string): string {
  const idx = fase.indexOf(" · ");
  return idx === -1 ? fase : fase.slice(0, idx);
}

function ordenFase(fase: string): number {
  const idx = (FASE_OPCIONES as readonly string[]).indexOf(fase);
  return idx === -1 ? FASE_OPCIONES.length : idx;
}

/** Ordena fases por el orden natural de `FASE_OPCIONES`, resto alfabético al final. */
export function ordenarFases(fases: string[]): string[] {
  return [...fases].sort((a, b) => {
    const diff = ordenFase(a) - ordenFase(b);
    return diff !== 0 ? diff : a.localeCompare(b);
  });
}
