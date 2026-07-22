/**
 * Catálogo de tests — parseo puro de `docs/mediciones-catalogo.csv` (fuente
 * de verdad de la batería real de tests). Formato: 3 líneas de cabecera de
 * texto libre, una fila de cabecera de columnas (`TEST;VARIABLE`), y luego
 * filas `TEST;VARIABLE (unidad)`. Ver CLAUDE.md y `lib/store/types.ts`.
 */

import { CATALOGO_CSV_RAW } from "./catalogo-raw";
import type { TestDef, TipoTest, VariableDef } from "./types";

const LINEAS_CABECERA = 3;

const DIACRITICOS = new RegExp("[\\u0300-\\u036f]", "g");

function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(DIACRITICOS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Separa "Altura (cm)" en { nombre: "Altura", unidad: "cm" }. Sin paréntesis, unidad "". */
function parseVariable(campo: string): { nombre: string; unidad: string } {
  const match = campo.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (!match) return { nombre: campo.trim(), unidad: "" };
  return { nombre: match[1].trim(), unidad: match[2].trim() };
}

function clasificarTipo(variables: VariableDef[]): TipoTest {
  if (variables.some((v) => v.nombre === "LSI" && v.unidad === "%")) {
    return "unilateral-lsi";
  }
  if (variables.every((v) => v.nombre.startsWith("Puntuación"))) {
    return "cuestionario-pro";
  }
  return "valor-unico";
}

/** Parsea el CSV completo del catálogo en `TestDef[]`. Pura, sin efectos. */
export function parseCatalogoCsv(csv: string): TestDef[] {
  const lineas = csv.split(/\r\n|\n|\r/).filter((l) => l.length > 0);
  const filas = lineas.slice(LINEAS_CABECERA + 1); // + fila de cabecera "TEST;VARIABLE"

  const porTest = new Map<string, { nombre: string; variables: VariableDef[] }>();

  for (const fila of filas) {
    const [testNombre, variableCampo] = fila.split(";");
    if (!testNombre || !variableCampo) continue;
    const testId = slugify(testNombre);
    const { nombre, unidad } = parseVariable(variableCampo);
    const variableId = slugify(nombre);

    const existente = porTest.get(testId);
    const variable: VariableDef = { id: variableId, nombre, unidad };
    if (existente) {
      existente.variables.push(variable);
    } else {
      porTest.set(testId, { nombre: testNombre.trim(), variables: [variable] });
    }
  }

  return Array.from(porTest.entries()).map(([id, { nombre, variables }]) => ({
    id,
    nombre,
    variables,
    tipo: clasificarTipo(variables),
  }));
}

export const catalogoSemilla: TestDef[] = parseCatalogoCsv(CATALOGO_CSV_RAW);

/** Busca un test del catálogo por su nombre exacto (tal y como aparece en el CSV). */
export function testPorNombre(catalogo: TestDef[], nombre: string): TestDef {
  const test = catalogo.find((t) => t.nombre === nombre);
  if (!test) throw new Error(`Test "${nombre}" no encontrado en el catálogo`);
  return test;
}

/** Busca una variable de un test por su nombre (sin unidad). */
export function variablePorNombre(test: TestDef, nombre: string): VariableDef {
  const variable = test.variables.find((v) => v.nombre === nombre);
  if (!variable) {
    throw new Error(`Variable "${nombre}" no encontrada en el test "${test.nombre}"`);
  }
  return variable;
}
