import { describe, expect, it } from "vitest";
import { simetria } from "@/lib/calculations";
import type { RegistroTest, TestDef } from "@/lib/store/types";
import { atletaFixture } from "@/lib/insights/test-helpers";
import {
  mediana,
  puntosCuadranteFV,
  rangoDesdeSemanas,
  semanasDesdeRango,
  semanasEnRango,
  serieTest,
  ultimoValorPorAtleta,
} from "./series-tests";

const TEST_UNILATERAL: TestDef = {
  id: "nordic",
  nombre: "Nordic",
  tipo: "unilateral-lsi",
  variables: [
    { id: "fuerza", nombre: "Fuerza", unidad: "N" },
    { id: "lsi", nombre: "LSI", unidad: "%" },
  ],
};

const TEST_VALOR_UNICO: TestDef = {
  id: "cmj",
  nombre: "CMJ",
  tipo: "valor-unico",
  variables: [
    { id: "altura", nombre: "Altura", unidad: "cm" },
    { id: "peak-power", nombre: "Peak power", unidad: "W/kg" },
  ],
};

const TEST_CUESTIONARIO: TestDef = {
  id: "acl-rsi",
  nombre: "ACL-RSI",
  tipo: "cuestionario-pro",
  variables: [{ id: "puntuacion", nombre: "Puntuación", unidad: "" }],
};

const TEST_IMTP: TestDef = {
  id: "imtp",
  nombre: "IMTP",
  tipo: "valor-unico",
  variables: [
    { id: "peak-force", nombre: "Peak force", unidad: "N" },
    { id: "fuerza-relativa", nombre: "Fuerza relativa", unidad: "N/kg" },
  ],
};

const TEST_VELOCIDAD: TestDef = {
  id: "velocidad-maxima",
  nombre: "Velocidad máxima",
  tipo: "valor-unico",
  variables: [{ id: "vmax", nombre: "Vmax", unidad: "m/s" }],
};

let contador = 0;
function reg(atletaId: string, test: TestDef, fecha: string, valores: RegistroTest["valores"]): RegistroTest {
  contador += 1;
  return { id: `reg-${contador}`, atletaId, testId: test.id, fecha, valores };
}

describe("semanasEnRango", () => {
  it("genera fechas semanales ancladas en 'hasta'", () => {
    expect(semanasEnRango(new Date("2026-07-01T00:00:00"), new Date("2026-07-15T00:00:00"))).toEqual([
      "2026-07-01",
      "2026-07-08",
      "2026-07-15",
    ]);
  });

  it("un único punto cuando desde === hasta", () => {
    expect(semanasEnRango(new Date("2026-07-10T00:00:00"), new Date("2026-07-10T00:00:00"))).toEqual([
      "2026-07-10",
    ]);
  });
});

describe("rangoDesdeSemanas", () => {
  it("convierte el rango legado (n semanas) a desde/hasta anclado en hoy", () => {
    const hoy = new Date("2026-07-23T00:00:00");
    const { desde, hasta } = rangoDesdeSemanas(4, hoy);
    expect(hasta).toEqual(hoy);
    // 3 * 7 días antes de hoy (2026-07-23), en fecha LOCAL (no toISOString, que
    // desplaza según el huso horario del entorno de test).
    expect(desde.getFullYear()).toBe(2026);
    expect(desde.getMonth()).toBe(6); // julio, 0-indexado
    expect(desde.getDate()).toBe(2);
  });
});

describe("semanasDesdeRango", () => {
  it("es la inversa de rangoDesdeSemanas para presets de n semanas", () => {
    const hoy = new Date("2026-07-23T00:00:00");
    for (const semanas of [4, 8, 12]) {
      const { desde, hasta } = rangoDesdeSemanas(semanas, hoy);
      expect(semanasDesdeRango(desde, hasta)).toBe(semanas);
    }
  });

  it("redondea al entero más cercano y nunca da menos de 1", () => {
    const hoy = new Date("2026-07-23T00:00:00");
    expect(semanasDesdeRango(hoy, hoy)).toBe(1);
  });
});

describe("serieTest", () => {
  it("valor-unico: interpola el valor bruto de la variable elegida entre dos registros", () => {
    const a1 = atletaFixture({ id: "a1" });
    const registros = [
      reg("a1", TEST_VALOR_UNICO, "2026-07-01", { altura: 30, "peak-power": 40 }),
      reg("a1", TEST_VALOR_UNICO, "2026-07-15", { altura: 40, "peak-power": 44 }),
    ];
    const serie = serieTest(
      registros,
      TEST_VALOR_UNICO,
      "altura",
      [a1],
      new Date("2026-07-01T00:00:00"),
      new Date("2026-07-15T00:00:00")
    );
    expect(serie.map((p) => p.porAtleta.a1)).toEqual([30, 35, 40]);
    expect(serie.map((p) => p.agregado)).toEqual([30, 35, 40]);
  });

  it("cuestionario-pro: lee siempre el campo puntuacion", () => {
    const a1 = atletaFixture({ id: "a1" });
    const registros = [reg("a1", TEST_CUESTIONARIO, "2026-07-05", { puntuacion: 68 })];
    const serie = serieTest(
      registros,
      TEST_CUESTIONARIO,
      "puntuacion",
      [a1],
      new Date("2026-07-05T00:00:00"),
      new Date("2026-07-05T00:00:00")
    );
    expect(serie).toHaveLength(1);
    expect(serie[0].porAtleta.a1).toBe(68);
  });

  it("unilateral-lsi: la variable LSI se calcula con simetria(izq, der), nunca se lee de valores", () => {
    const a1 = atletaFixture({ id: "a1" });
    const registros = [reg("a1", TEST_UNILATERAL, "2026-07-10", { fuerza: { izq: 30, der: 35 } })];
    const fecha = new Date("2026-07-10T00:00:00");
    const serie = serieTest(registros, TEST_UNILATERAL, "lsi", [a1], fecha, fecha);
    expect(serie[0].porAtleta.a1).toBeCloseTo(simetria(30, 35), 5);
    expect(serie[0].porAtleta.a1).toBeCloseTo(85.71, 2);
  });

  it("unilateral-lsi: la variable base (no LSI) usa el lado fuerte (max izq/der)", () => {
    const a1 = atletaFixture({ id: "a1" });
    const registros = [reg("a1", TEST_UNILATERAL, "2026-07-10", { fuerza: { izq: 30, der: 35 } })];
    const fecha = new Date("2026-07-10T00:00:00");
    const serie = serieTest(registros, TEST_UNILATERAL, "fuerza", [a1], fecha, fecha);
    expect(serie[0].porAtleta.a1).toBe(35);
  });

  it("agrega por MEDIA ignorando atletas sin registros (null, nunca 0)", () => {
    const a1 = atletaFixture({ id: "a1" });
    const a2 = atletaFixture({ id: "a2" });
    const fecha = new Date("2026-07-10T00:00:00");
    const registros = [reg("a1", TEST_VALOR_UNICO, "2026-07-10", { altura: 30, "peak-power": 40 })];
    const serie = serieTest(registros, TEST_VALOR_UNICO, "altura", [a1, a2], fecha, fecha);
    expect(serie[0].porAtleta.a2).toBeNull();
    expect(serie[0].agregado).toBe(30);
  });
});

describe("ultimoValorPorAtleta", () => {
  const a1 = atletaFixture({ id: "a1" });
  const a2 = atletaFixture({ id: "a2" });
  const registros = [
    reg("a1", TEST_VALOR_UNICO, "2026-06-01", { altura: 30, "peak-power": 40 }),
    reg("a1", TEST_VALOR_UNICO, "2026-07-01", { altura: 36, "peak-power": 42 }),
  ];

  it("da el registro más reciente de cada atleta", () => {
    const resultado = ultimoValorPorAtleta(registros, TEST_VALOR_UNICO, "altura", [a1]);
    expect(resultado).toEqual([{ atletaId: "a1", valor: 36, fecha: "2026-07-01" }]);
  });

  it("da null (no 0) para un atleta sin registros del test", () => {
    const resultado = ultimoValorPorAtleta(registros, TEST_VALOR_UNICO, "altura", [a2]);
    expect(resultado).toEqual([{ atletaId: "a2", valor: null, fecha: null }]);
  });

  it("respeta el límite `hasta`: ignora registros posteriores", () => {
    const resultado = ultimoValorPorAtleta(
      registros,
      TEST_VALOR_UNICO,
      "altura",
      [a1],
      new Date("2026-06-15T00:00:00")
    );
    expect(resultado).toEqual([{ atletaId: "a1", valor: 30, fecha: "2026-06-01" }]);
  });
});

describe("puntosCuadranteFV", () => {
  const catalogo = [TEST_IMTP, TEST_VELOCIDAD];
  const a1 = atletaFixture({ id: "a1" });
  const a2 = atletaFixture({ id: "a2" });
  const a3 = atletaFixture({ id: "a3" });

  it("combina el último IMTP (fuerza relativa) y la última Vmax por atleta", () => {
    const registros = [
      reg("a1", TEST_IMTP, "2026-07-01", { "peak-force": 2000, "fuerza-relativa": 30 }),
      reg("a1", TEST_VELOCIDAD, "2026-07-01", { vmax: 7.5 }),
    ];
    const puntos = puntosCuadranteFV(registros, catalogo, [a1]);
    expect(puntos).toEqual([{ atletaId: "a1", x: 30, y: 7.5 }]);
  });

  it("omite atletas a los que les falta un eje", () => {
    const registros = [
      reg("a1", TEST_IMTP, "2026-07-01", { "peak-force": 2000, "fuerza-relativa": 30 }),
      reg("a1", TEST_VELOCIDAD, "2026-07-01", { vmax: 7.5 }),
      reg("a2", TEST_IMTP, "2026-07-01", { "peak-force": 1800, "fuerza-relativa": 28 }), // sin Vmax
      reg("a3", TEST_VELOCIDAD, "2026-07-01", { vmax: 8.0 }), // sin IMTP
    ];
    const puntos = puntosCuadranteFV(registros, catalogo, [a1, a2, a3]);
    expect(puntos).toEqual([{ atletaId: "a1", x: 30, y: 7.5 }]);
  });
});

describe("mediana", () => {
  it("nº impar de valores: el central", () => {
    expect(mediana([3, 1, 2])).toBe(2);
  });

  it("nº par de valores: media de los dos centrales", () => {
    expect(mediana([1, 2, 3, 4])).toBe(2.5);
  });

  it("sin valores: 0", () => {
    expect(mediana([])).toBe(0);
  });
});
