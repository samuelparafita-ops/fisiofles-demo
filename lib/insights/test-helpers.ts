import type { Atleta, Config, TestDef } from "@/lib/store/types";

export function atletaFixture(overrides: Partial<Atleta> = {}): Atleta {
  return {
    id: "atleta-1",
    nombre: "Atleta de prueba",
    deporte: "Fútbol",
    lesion: "Lesión de prueba",
    fase: "Fase 1",
    semanaProceso: 4,
    avatarInitials: "AP",
    sexo: "Mujer",
    estado: "activo",
    notas: [],
    hitos: [],
    perfilFisico: [],
    acwr: [],
    evolucion: [],
    ...overrides,
  };
}

export const UMBRALES_FIXTURE: Config["umbrales"] = {
  acwrBajo: 0.8,
  acwrAlto: 1.3,
  simetriaObjetivo: 90,
  simetriaAceptable: 85,
  dolorAlerta: 5,
};

export const CATALOGO_FIXTURE: TestDef[] = [
  {
    id: "sl-cmj",
    nombre: "SL CMJ",
    tipo: "unilateral-lsi",
    variables: [
      { id: "altura", nombre: "Altura", unidad: "cm" },
      { id: "lsi", nombre: "LSI", unidad: "%" },
    ],
  },
];
