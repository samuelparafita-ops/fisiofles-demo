import { describe, expect, it } from "vitest";
import { buildSeed } from "./seed";
import type { ValorCuestionario, ValorUnico, ValorUnilateral } from "@/lib/store/types";

const seed = buildSeed();

/** Caso "recién llegada / datos escasos" de la demo: queda fuera de la ampliación a propósito. */
const ATLETA_DATOS_ESCASOS = "nerea-otxoa";

function esNumero(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

describe("semilla · cobertura de registros de test", () => {
  it("cada test del catálogo tiene registros de al menos 6 atletas distintos", () => {
    const atletasPorTest = new Map<string, Set<string>>();
    for (const registro of seed.registrosTests) {
      const set = atletasPorTest.get(registro.testId) ?? new Set<string>();
      set.add(registro.atletaId);
      atletasPorTest.set(registro.testId, set);
    }

    const insuficientes = seed.catalogoTests
      .map((test) => ({ test: test.id, atletas: atletasPorTest.get(test.id)?.size ?? 0 }))
      .filter((t) => t.atletas < 6);

    expect(insuficientes).toEqual([]);
  });

  it("cada par atleta/test tiene entre 3 y 6 registros", () => {
    const porPar = new Map<string, number>();
    for (const registro of seed.registrosTests) {
      if (registro.atletaId === ATLETA_DATOS_ESCASOS) continue;
      const clave = `${registro.atletaId}:${registro.testId}`;
      porPar.set(clave, (porPar.get(clave) ?? 0) + 1);
    }

    const fuera = Array.from(porPar.entries()).filter(([, n]) => n < 3 || n > 6);
    expect(fuera).toEqual([]);
  });

  it("todos los registros caen dentro de las últimas 16 semanas", () => {
    const hoy = new Date();
    const limite = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 7 * 16 - 1);
    const antiguos = seed.registrosTests.filter((r) => new Date(`${r.fecha}T00:00:00`) < limite);
    expect(antiguos).toEqual([]);
  });
});

describe("semilla · los registros respetan su TipoTest", () => {
  it("unilateral-lsi guarda {izq, der} por variable y nunca el LSI", () => {
    const tests = seed.catalogoTests.filter((t) => t.tipo === "unilateral-lsi");
    for (const test of tests) {
      const variablesBase = test.variables.filter((v) => !(v.nombre === "LSI" && v.unidad === "%"));
      for (const registro of seed.registrosTests.filter((r) => r.testId === test.id)) {
        const valores = registro.valores as ValorUnilateral;
        expect(Object.keys(valores).length).toBeGreaterThan(0);
        for (const [variableId, valor] of Object.entries(valores)) {
          expect(variablesBase.map((v) => v.id)).toContain(variableId);
          expect(esNumero(valor?.izq) && esNumero(valor?.der)).toBe(true);
        }
      }
    }
  });

  it("valor-unico guarda un número por variable del test", () => {
    const tests = seed.catalogoTests.filter((t) => t.tipo === "valor-unico");
    for (const test of tests) {
      const ids = test.variables.map((v) => v.id);
      for (const registro of seed.registrosTests.filter((r) => r.testId === test.id)) {
        const valores = registro.valores as ValorUnico;
        expect(Object.keys(valores).length).toBeGreaterThan(0);
        for (const [variableId, valor] of Object.entries(valores)) {
          expect(ids).toContain(variableId);
          expect(esNumero(valor)).toBe(true);
        }
      }
    }
  });

  it("cuestionario-pro guarda solo { puntuacion }", () => {
    const testIds = seed.catalogoTests.filter((t) => t.tipo === "cuestionario-pro").map((t) => t.id);
    for (const registro of seed.registrosTests.filter((r) => testIds.includes(r.testId))) {
      const valores = registro.valores as ValorCuestionario;
      expect(Object.keys(valores)).toEqual(["puntuacion"]);
      expect(esNumero(valores.puntuacion)).toBe(true);
    }
  });

  it("todo registro apunta a un test del catálogo y a un atleta existente", () => {
    const testIds = new Set(seed.catalogoTests.map((t) => t.id));
    const atletaIds = new Set(seed.atletas.map((a) => a.id));
    for (const registro of seed.registrosTests) {
      expect(testIds.has(registro.testId)).toBe(true);
      expect(atletaIds.has(registro.atletaId)).toBe(true);
    }
  });
});

describe("semilla · modelo v3", () => {
  it("siembra 3 entrenadores y los atletas asignados apuntan a uno real", () => {
    expect(seed.entrenadores).toHaveLength(3);
    const ids = new Set(seed.entrenadores.map((e) => e.id));
    for (const atleta of seed.atletas) {
      if (atleta.entrenadorId) expect(ids.has(atleta.entrenadorId)).toBe(true);
    }
  });

  it("deja 1-2 atletas sin entrenador (caso vacío de la UI de asignación)", () => {
    const sinAsignar = seed.atletas.filter((a) => !a.entrenadorId);
    expect(sinAsignar.length).toBeGreaterThanOrEqual(1);
    expect(sinAsignar.length).toBeLessThanOrEqual(2);
  });

  it("ningún entrenador supera su capacidad máxima", () => {
    for (const entrenador of seed.entrenadores) {
      const asignados = seed.atletas.filter((a) => a.entrenadorId === entrenador.id).length;
      expect(asignados).toBeLessThanOrEqual(entrenador.capacidadMaxima);
    }
  });

  it("todos los atletas activos tienen suscripción con fin posterior al inicio", () => {
    for (const atleta of seed.atletas.filter((a) => a.estado === "activo")) {
      expect(atleta.suscripcion).toBeDefined();
      expect(atleta.suscripcion!.fechaFin > atleta.suscripcion!.fechaInicio).toBe(true);
    }
  });

  it("todo punto de evolución tiene readiness en 0-10, sin huecos", () => {
    for (const atleta of seed.atletas) {
      expect(atleta.evolucion.length).toBeGreaterThan(0);
      for (const punto of atleta.evolucion) {
        expect(esNumero(punto.readiness)).toBe(true);
        expect(punto.readiness).toBeGreaterThanOrEqual(0);
        expect(punto.readiness).toBeLessThanOrEqual(10);
      }
    }
  });

  it("todos los atletas tienen anamnesis de 6-8 pares con contenido", () => {
    for (const atleta of seed.atletas) {
      expect(atleta.anamnesis).toBeDefined();
      expect(atleta.anamnesis!.length).toBeGreaterThanOrEqual(6);
      expect(atleta.anamnesis!.length).toBeLessThanOrEqual(8);
      for (const par of atleta.anamnesis!) {
        expect(par.pregunta.length).toBeGreaterThan(0);
        expect(par.respuesta.length).toBeGreaterThan(0);
      }
    }
  });

  it("ningún atleta trae foto en la semilla (las vistas pintan placeholder)", () => {
    expect(seed.atletas.every((a) => a.fotoUrl === undefined)).toBe(true);
  });

  it("config.dashboardGraficos usa ids válidos y abre con el cuadrante F-V", () => {
    const { dashboardGraficos, dashboardGraficosOrden } = seed.config;
    expect(dashboardGraficosOrden[0]).toBe("resultado:cuadrante-fv");
    expect(dashboardGraficosOrden).toEqual(dashboardGraficos);

    const testIds = new Set(seed.catalogoTests.map((t) => t.id));
    for (const grafico of dashboardGraficos) {
      const [familia, resto] = grafico.split(":");
      expect(["test", "resultado"]).toContain(familia);
      if (familia === "test") expect(testIds.has(resto)).toBe(true);
    }
  });

  it("es determinista: dos semillas seguidas son idénticas", () => {
    expect(buildSeed()).toEqual(buildSeed());
  });
});
