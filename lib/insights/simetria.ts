import { simetria } from "@/lib/calculations";
import type { RegistroTest, TestDef, UmbralesConfig, ValorUnilateral } from "@/lib/store/types";
import type { Hallazgo } from "./tipos";

type PuntoSimetria = {
  test: TestDef;
  variableId: string;
  variableNombre: string;
  fecha: string;
  pct: number;
};

/** Aplana los registros unilateral-lsi de un atleta en puntos {test, variable, fecha, %}. */
export function puntosSimetria(registros: RegistroTest[], catalogo: TestDef[]): PuntoSimetria[] {
  const puntos: PuntoSimetria[] = [];
  for (const registro of registros) {
    const test = catalogo.find((t) => t.id === registro.testId);
    if (!test || test.tipo !== "unilateral-lsi") continue;
    const valores = registro.valores as ValorUnilateral;
    for (const [variableId, valor] of Object.entries(valores)) {
      const variable = test.variables.find((v) => v.id === variableId);
      puntos.push({
        test,
        variableId,
        variableNombre: variable?.nombre ?? variableId,
        fecha: registro.fecha,
        pct: simetria(valor.izq, valor.der),
      });
    }
  }
  return puntos;
}

/** Agrupa los puntos por test+variable, ordenados cronológicamente. */
export function agruparPorTestVariable(puntos: PuntoSimetria[]): Map<string, PuntoSimetria[]> {
  const porClave = new Map<string, PuntoSimetria[]>();
  for (const p of puntos) {
    const clave = `${p.test.id}:${p.variableId}`;
    const lista = porClave.get(clave) ?? [];
    lista.push(p);
    porClave.set(clave, lista);
  }
  for (const lista of Array.from(porClave.values())) {
    lista.sort((a, b) => a.fecha.localeCompare(b.fecha));
  }
  return porClave;
}

/**
 * Regla 2: simetría de un test por debajo de `umbrales.simetriaAceptable`
 * (última medición), o caída >5 puntos entre las dos últimas fechas del
 * mismo test+variable.
 */
export function hallazgosSimetria(
  atletaId: string,
  registros: RegistroTest[],
  catalogo: TestDef[],
  umbrales: UmbralesConfig
): Hallazgo[] {
  const porClave = agruparPorTestVariable(puntosSimetria(registros, catalogo));
  const hallazgos: Hallazgo[] = [];

  for (const lista of Array.from(porClave.values())) {
    const ultima = lista[lista.length - 1];

    if (ultima.pct < umbrales.simetriaAceptable) {
      hallazgos.push({
        id: `hallazgo-simetria-deficit-${atletaId}-${ultima.test.id}-${ultima.variableId}`,
        atletaId,
        severidad: "atencion",
        titulo: "Déficit de simetría",
        detalle: `${ultima.test.nombre} (${ultima.variableNombre}) está en ${ultima.pct.toFixed(0)}%, por debajo del umbral aceptable (${umbrales.simetriaAceptable}%).`,
        fecha: ultima.fecha,
        enlace: `/atletas/${atletaId}`,
      });
    }

    if (lista.length >= 2) {
      const penultima = lista[lista.length - 2];
      const caida = penultima.pct - ultima.pct;
      if (caida > 5) {
        hallazgos.push({
          id: `hallazgo-simetria-caida-${atletaId}-${ultima.test.id}-${ultima.variableId}`,
          atletaId,
          severidad: "atencion",
          titulo: "Caída de simetría entre mediciones",
          detalle: `${ultima.test.nombre} (${ultima.variableNombre}) ha caído ${caida.toFixed(0)} puntos respecto a la medición anterior (${penultima.pct.toFixed(0)}% → ${ultima.pct.toFixed(0)}%).`,
          fecha: ultima.fecha,
          enlace: `/atletas/${atletaId}`,
        });
      }
    }
  }

  return hallazgos;
}

/**
 * Regla 6b: la simetría de un test cruza `umbrales.simetriaObjetivo` al alza
 * entre las dos últimas mediciones (severidad "info").
 */
export function hallazgosRachaSimetria(
  atletaId: string,
  registros: RegistroTest[],
  catalogo: TestDef[],
  umbrales: UmbralesConfig
): Hallazgo[] {
  const porClave = agruparPorTestVariable(puntosSimetria(registros, catalogo));
  const hallazgos: Hallazgo[] = [];

  for (const lista of Array.from(porClave.values())) {
    if (lista.length < 2) continue;
    const anterior = lista[lista.length - 2];
    const ultima = lista[lista.length - 1];
    if (anterior.pct < umbrales.simetriaObjetivo && ultima.pct >= umbrales.simetriaObjetivo) {
      hallazgos.push({
        id: `hallazgo-racha-simetria-${atletaId}-${ultima.test.id}-${ultima.variableId}`,
        atletaId,
        severidad: "info",
        titulo: "Simetría alcanza el objetivo",
        detalle: `${ultima.test.nombre} (${ultima.variableNombre}) ha cruzado el objetivo de simetría (${umbrales.simetriaObjetivo}%): ${anterior.pct.toFixed(0)}% → ${ultima.pct.toFixed(0)}%.`,
        fecha: ultima.fecha,
        enlace: `/atletas/${atletaId}`,
      });
    }
  }

  return hallazgos;
}
