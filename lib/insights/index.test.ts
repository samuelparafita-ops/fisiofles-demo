import { describe, expect, it } from "vitest";
import type { Config, FormularioEnvio, RegistroTest } from "@/lib/store/types";
import { ACENTO_DEFECTO } from "@/lib/personalizacion/acentos";
import { generarHallazgos } from "./index";
import { atletaFixture, CATALOGO_FIXTURE, UMBRALES_FIXTURE } from "./test-helpers";

const AHORA = new Date("2026-07-22T12:00:00");

const CONFIG: Config = {
  tema: "fisiofles",
  acento: ACENTO_DEFECTO,
  umbrales: UMBRALES_FIXTURE,
  metricasVisiblesDashboard: [],
  ordenDashboard: [],
  vistaAtletas: "grid",
  dashboardMetricas: [],
  dashboardOrden: [],
};

function semanas(agudos: number[]) {
  return agudos.map((agudo, i) => ({ semana: `S${i + 1}`, agudo }));
}

function registroSimetria(atletaId: string, izq: number, der: number): RegistroTest {
  return {
    id: `reg-${atletaId}`,
    atletaId,
    testId: "sl-cmj",
    fecha: "2026-07-10",
    valores: { altura: { izq, der } },
  };
}

function envioPendiente(atletaId: string, fechaEnvio: string): FormularioEnvio {
  return { id: `envio-${atletaId}`, formularioId: "form-1", atletaId, fechaEnvio, estado: "pendiente" };
}

/** atleta-a: ACWR en riesgo + déficit de simetría. atleta-b: formulario vencido. */
function escenario() {
  const atletaA = atletaFixture({
    id: "atleta-a",
    acwr: semanas([500, 500, 500, 500, 900]), // ratio 1.80 → riesgo
  });
  const atletaB = atletaFixture({
    id: "atleta-b",
    acwr: semanas([500, 510, 505]), // sin ratio calculable → sin hallazgo ACWR
  });

  return {
    atletas: [atletaA, atletaB],
    // Sesión futura para ambos → la regla "sin sesiones" no interfiere en el test.
    sesiones: [
      { id: "s-a", atletaId: "atleta-a", fecha: "2026-07-24", dia: "Viernes" as const, nombre: "S", ejercicios: [], estado: "programada" as const },
      { id: "s-b", atletaId: "atleta-b", fecha: "2026-07-24", dia: "Viernes" as const, nombre: "S", ejercicios: [], estado: "programada" as const },
    ],
    registrosTests: [registroSimetria("atleta-a", 12, 20)], // 60% → déficit, SOLO para atleta-a
    catalogoTests: CATALOGO_FIXTURE,
    formulariosEnvios: [envioPendiente("atleta-b", "2026-07-18")], // >48h → vencido, SOLO atleta-b
    config: CONFIG,
    ahora: AHORA,
  };
}

describe("generarHallazgos (orquestador)", () => {
  it("sin atletas devuelve lista vacía", () => {
    expect(
      generarHallazgos({
        atletas: [],
        sesiones: [],
        registrosTests: [],
        catalogoTests: CATALOGO_FIXTURE,
        formulariosEnvios: [],
        config: CONFIG,
        ahora: AHORA,
      })
    ).toEqual([]);
  });

  it("agrega hallazgos de reglas distintas y de atletas distintos", () => {
    const hallazgos = generarHallazgos(escenario());

    // De atleta-a (regla ACWR) y de atleta-b (regla formularios): agregación cruzada.
    expect(hallazgos.some((h) => h.atletaId === "atleta-a" && h.titulo === "ACWR en zona de riesgo")).toBe(true);
    expect(hallazgos.some((h) => h.atletaId === "atleta-b" && h.titulo === "Formulario sin responder")).toBe(true);
  });

  it("filtra registros y envíos por atleta (no se cruzan entre atletas)", () => {
    const hallazgos = generarHallazgos(escenario());

    // El déficit de simetría nace del registro de atleta-a → nunca se atribuye a atleta-b.
    const deficit = hallazgos.filter((h) => h.titulo === "Déficit de simetría");
    expect(deficit).toHaveLength(1);
    expect(deficit[0].atletaId).toBe("atleta-a");

    // El formulario vencido es de atleta-b → nunca se atribuye a atleta-a.
    const formularios = hallazgos.filter((h) => h.titulo === "Formulario sin responder");
    expect(formularios.every((h) => h.atletaId === "atleta-b")).toBe(true);

    // Todo hallazgo pertenece a uno de los atletas de entrada.
    expect(hallazgos.every((h) => h.atletaId === "atleta-a" || h.atletaId === "atleta-b")).toBe(true);
  });

  it("respeta `ahora`: con la fecha justo tras el envío, el formulario aún no está vencido", () => {
    const input = escenario();
    // Envío el 2026-07-18; a las 24h (2026-07-19) todavía no supera el límite de 48h.
    const hallazgos = generarHallazgos({ ...input, ahora: new Date("2026-07-19T12:00:00") });
    expect(hallazgos.some((h) => h.titulo === "Formulario sin responder")).toBe(false);
  });
});
