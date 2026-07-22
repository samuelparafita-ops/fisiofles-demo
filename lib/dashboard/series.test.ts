import { describe, expect, it } from "vitest";
import type { RegistroTest, Sesion } from "@/lib/store";
import { CATALOGO_FIXTURE, UMBRALES_FIXTURE } from "@/lib/insights/test-helpers";
import {
  interpolarEnFecha,
  promedio,
  resumenZonaOptimaAcwr,
  semanasOffset,
  serieAcwr,
  serieCargaSemanal,
  serieDolorMedio,
  serieSesionesCompletadas,
  serieSimetriaMedia,
} from "./series";

const HOY = new Date("2026-07-23T00:00:00");

describe("semanasOffset", () => {
  it("genera n semanas de la más antigua a 'Actual', espaciadas 7 días", () => {
    const semanas = semanasOffset(HOY, 3);
    expect(semanas.map((s) => s.label)).toEqual(["Hace 2 sem.", "Hace 1 sem.", "Actual"]);
    expect(semanas.map((s) => s.fecha)).toEqual(["2026-07-09", "2026-07-16", "2026-07-23"]);
  });
});

describe("promedio", () => {
  it("ignora null/undefined", () => {
    expect(promedio([10, null, 20, undefined])).toBe(15);
  });
  it("da null si no queda ningún valor", () => {
    expect(promedio([null, undefined])).toBeNull();
  });
});

describe("interpolarEnFecha", () => {
  const puntos = [
    { fecha: "2026-07-01", valor: 80 },
    { fecha: "2026-07-11", valor: 90 },
  ];

  it("interpola linealmente entre dos puntos conocidos", () => {
    expect(interpolarEnFecha(puntos, "2026-07-06")).toBeCloseTo(85, 5);
  });
  it("devuelve el valor exacto en un extremo conocido", () => {
    expect(interpolarEnFecha(puntos, "2026-07-01")).toBe(80);
    expect(interpolarEnFecha(puntos, "2026-07-11")).toBe(90);
  });
  it("no extrapola hacia atrás: null antes del primer punto", () => {
    expect(interpolarEnFecha(puntos, "2026-06-20")).toBeNull();
  });
  it("arrastra el último valor conocido hacia delante", () => {
    expect(interpolarEnFecha(puntos, "2026-08-01")).toBe(90);
  });
  it("sin puntos: siempre null", () => {
    expect(interpolarEnFecha([], "2026-07-01")).toBeNull();
  });
});

describe("serieCargaSemanal", () => {
  const atletas = [
    { id: "a1", acwr: [{ agudo: 100 }, { agudo: 110 }, { agudo: 120 }] },
    { id: "a2", acwr: [{ agudo: 200 }] }, // solo tiene la semana "Actual"
  ];

  it("agrega por SUMA y deja null donde el atleta no tiene historial", () => {
    const serie = serieCargaSemanal(atletas, 3, HOY);
    expect(serie).toHaveLength(3);
    expect(serie[0].porAtleta).toEqual({ a1: 100, a2: null });
    expect(serie[0].agregado).toBe(100);
    expect(serie[2].porAtleta).toEqual({ a1: 120, a2: 200 });
    expect(serie[2].agregado).toBe(320);
  });
});

describe("serieAcwr", () => {
  it("agrega por MEDIA del ratio, no por el ratio de la suma", () => {
    const atletas = [
      { id: "a1", acwr: [100, 100, 100, 100, 200].map((agudo) => ({ agudo })) },
      { id: "a2", acwr: [50, 50, 50, 50, 50].map((agudo) => ({ agudo })) },
    ];
    const serie = serieAcwr(atletas, 1, HOY);
    // a1: 200 / avg(100,100,100,100) = 2.0 · a2: 50/50 = 1.0 → media 1.5
    expect(serie[0].porAtleta.a1).toBeCloseTo(2.0, 5);
    expect(serie[0].porAtleta.a2).toBeCloseTo(1.0, 5);
    expect(serie[0].agregado).toBeCloseTo(1.5, 5);
  });
});

describe("resumenZonaOptimaAcwr", () => {
  it("cuenta cuántos atletas están en zona óptima en su última semana", () => {
    const atletas = [
      { id: "optimo", acwr: [100, 100, 100, 100, 110].map((agudo) => ({ agudo })) }, // ratio 1.1 → óptima
      { id: "riesgo", acwr: [100, 100, 100, 100, 300].map((agudo) => ({ agudo })) }, // ratio 3.0 → riesgo
      { id: "sin-datos", acwr: [] },
    ];
    const umbrales = { bajo: UMBRALES_FIXTURE.acwrBajo, alto: UMBRALES_FIXTURE.acwrAlto };
    expect(resumenZonaOptimaAcwr(atletas, umbrales)).toEqual({ enOptima: 1, total: 3 });
  });
});

describe("serieSimetriaMedia", () => {
  it("interpola la simetría pooleando todos los tests unilaterales del atleta", () => {
    const registros: RegistroTest[] = [
      { id: "r1", atletaId: "a1", testId: "sl-cmj", fecha: "2026-07-01", valores: { altura: { izq: 16, der: 20 } } }, // 80%
      { id: "r2", atletaId: "a1", testId: "sl-cmj", fecha: "2026-07-11", valores: { altura: { izq: 18, der: 20 } } }, // 90%
    ];
    const serie = serieSimetriaMedia([{ id: "a1" }], registros, CATALOGO_FIXTURE, 1, new Date("2026-07-06T00:00:00"));
    expect(serie[0].porAtleta.a1).toBeCloseTo(85, 5);
    expect(serie[0].agregado).toBeCloseTo(85, 5);
  });

  it("un atleta sin tests todavía da null (no rompe el agregado del resto)", () => {
    const registros: RegistroTest[] = [
      { id: "r1", atletaId: "a1", testId: "sl-cmj", fecha: "2026-07-01", valores: { altura: { izq: 18, der: 20 } } }, // 90%
    ];
    const serie = serieSimetriaMedia(
      [{ id: "a1" }, { id: "a2" }],
      registros,
      CATALOGO_FIXTURE,
      1,
      new Date("2026-07-01T00:00:00")
    );
    expect(serie[0].porAtleta).toEqual({ a1: 90, a2: null });
    expect(serie[0].agregado).toBeCloseTo(90, 5);
  });
});

describe("serieDolorMedio", () => {
  it("interpola el dolor entre puntos de evolución", () => {
    const atletas = [
      {
        id: "a1",
        evolucion: [
          { fecha: "2026-07-01", dolor: 6 },
          { fecha: "2026-07-11", dolor: 2 },
        ],
      },
    ];
    const serie = serieDolorMedio(atletas, 1, new Date("2026-07-06T00:00:00"));
    expect(serie[0].porAtleta.a1).toBeCloseTo(4, 5);
  });
});

describe("serieSesionesCompletadas", () => {
  it("cuenta solo sesiones completadas dentro de la ventana de 7 días", () => {
    const sesiones: Sesion[] = [
      { id: "s1", atletaId: "a1", fecha: "2026-07-20", dia: "Lunes", nombre: "S1", ejercicios: [], estado: "completada" },
      { id: "s2", atletaId: "a1", fecha: "2026-07-22", dia: "Miércoles", nombre: "S2", ejercicios: [], estado: "completada" },
      { id: "s3", atletaId: "a1", fecha: "2026-07-23", dia: "Jueves", nombre: "S3", ejercicios: [], estado: "programada" },
      { id: "s4", atletaId: "a2", fecha: "2026-07-01", dia: "Miércoles", nombre: "S4", ejercicios: [], estado: "completada" },
    ];
    const serie = serieSesionesCompletadas([{ id: "a1" }, { id: "a2" }], sesiones, 1, HOY);
    expect(serie[0].porAtleta).toEqual({ a1: 2, a2: 0 });
    expect(serie[0].agregado).toBe(2);
  });
});
