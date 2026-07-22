import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import { parseCatalogoCsv, catalogoSemilla } from "./catalogo";
import { CATALOGO_CSV_RAW } from "./catalogo-raw";

const CSV_REAL = readFileSync(
  path.resolve(__dirname, "../../docs/mediciones-catalogo.csv"),
  "utf8"
);

describe("parseCatalogoCsv", () => {
  it("parsea el catálogo real: 32 tests / 54 pares test-variable", () => {
    const catalogo = parseCatalogoCsv(CSV_REAL);
    const totalPares = catalogo.reduce((acc, t) => acc + t.variables.length, 0);
    expect(catalogo).toHaveLength(32);
    expect(totalPares).toBe(54);
  });

  it("clasifica 9 tests como unilateral-lsi", () => {
    const catalogo = parseCatalogoCsv(CSV_REAL);
    const unilaterales = catalogo.filter((t) => t.tipo === "unilateral-lsi");
    expect(unilaterales).toHaveLength(9);
    expect(unilaterales.map((t) => t.nombre).sort()).toEqual(
      [
        "Crossover hop",
        "Dinamometría aductores",
        "Dinamometría cuádriceps",
        "Dinamometría isquios",
        "Nordic",
        "SL CMJ",
        "SL Drop Jump",
        "Single hop",
        "Triple hop",
      ].sort()
    );
  });

  it("clasifica 6 tests como cuestionario-pro", () => {
    const catalogo = parseCatalogoCsv(CSV_REAL);
    const pro = catalogo.filter((t) => t.tipo === "cuestionario-pro");
    expect(pro).toHaveLength(6);
    expect(pro.map((t) => t.nombre).sort()).toEqual(
      ["ACL-RSI", "IKDC", "KOOS", "LEFS", "NPRS", "VISA-A"].sort()
    );
  });

  it("clasifica el resto (17) como valor-unico", () => {
    const catalogo = parseCatalogoCsv(CSV_REAL);
    const valorUnico = catalogo.filter((t) => t.tipo === "valor-unico");
    expect(valorUnico).toHaveLength(17);
  });

  it("separa nombre y unidad de cada variable", () => {
    const catalogo = parseCatalogoCsv(CSV_REAL);
    const cmj = catalogo.find((t) => t.nombre === "CMJ")!;
    const altura = cmj.variables.find((v) => v.nombre === "Altura")!;
    expect(altura.unidad).toBe("cm");
    const rsiMod = cmj.variables.find((v) => v.nombre === "RSI-mod")!;
    expect(rsiMod.unidad).toBe("");
  });

  it("da ids estables y en minúsculas sin acentos", () => {
    const catalogo = parseCatalogoCsv(CSV_REAL);
    const dinamo = catalogo.find((t) => t.nombre === "Dinamometría cuádriceps")!;
    expect(dinamo.id).toBe("dinamometria-cuadriceps");
  });

  it("la copia embebida (catalogo-raw.ts) coincide con el fichero real", () => {
    expect(parseCatalogoCsv(CATALOGO_CSV_RAW)).toEqual(parseCatalogoCsv(CSV_REAL));
  });
});

describe("catalogoSemilla", () => {
  it("se exporta ya parseado y con las mismas 32 entradas", () => {
    expect(catalogoSemilla).toHaveLength(32);
  });
});
