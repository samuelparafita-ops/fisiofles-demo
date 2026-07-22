import type { RegistroTest, TestDef, ValorUnilateral } from "./types";

export type FilaSimetria = { test: string; fecha: string; izq: number; der: number };

/**
 * Reconstruye la forma plana `{test, fecha, izq, der}[]` que consumen
 * `SimetriaBar`/`TestsTable`/`AtletaCard` (sin cambios en esos componentes)
 * a partir de los `RegistroTest` de tests "unilateral-lsi". El LSI nunca se
 * lee de aquí: esos componentes lo calculan con `simetria()`.
 */
export function simetriasDesdeRegistros(
  registros: RegistroTest[],
  catalogo: TestDef[]
): FilaSimetria[] {
  const filas: FilaSimetria[] = [];

  for (const registro of registros) {
    const test = catalogo.find((t) => t.id === registro.testId);
    if (!test || test.tipo !== "unilateral-lsi") continue;

    const variablesBase = test.variables.filter((v) => !(v.nombre === "LSI" && v.unidad === "%"));
    const valores = registro.valores as ValorUnilateral;

    for (const [variableId, valor] of Object.entries(valores)) {
      const variable = variablesBase.find((v) => v.id === variableId);
      const etiqueta =
        variablesBase.length <= 1 ? test.nombre : `${test.nombre} · ${variable?.nombre ?? variableId}`;
      filas.push({ test: etiqueta, fecha: registro.fecha, izq: valor.izq, der: valor.der });
    }
  }

  return filas;
}
