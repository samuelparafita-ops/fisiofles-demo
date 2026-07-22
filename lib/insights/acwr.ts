import { acwr, cargaCronica, zonaAcwr } from "@/lib/calculations";
import type { Atleta, UmbralesConfig } from "@/lib/store/types";
import type { Hallazgo } from "./tipos";

/** Regla 1: ACWR de la última semana fuera de la banda óptima de `config.umbrales`. */
export function hallazgosAcwr(atleta: Atleta, umbrales: UmbralesConfig): Hallazgo[] {
  const agudos = atleta.acwr.map((c) => c.agudo);
  const ultimoIdx = agudos.length - 1;
  if (ultimoIdx < 0) return [];

  const cronica = cargaCronica(agudos, ultimoIdx);
  const ratio = acwr(agudos[ultimoIdx], cronica);
  if (ratio === null) return [];

  const bandas = { bajo: umbrales.acwrBajo, alto: umbrales.acwrAlto };
  const zona = zonaAcwr(ratio, bandas);
  if (zona === "optima") return [];

  return [
    {
      id: `hallazgo-acwr-${atleta.id}`,
      atletaId: atleta.id,
      severidad: "atencion",
      titulo: zona === "riesgo" ? "ACWR en zona de riesgo" : "ACWR en zona insuficiente",
      detalle:
        zona === "riesgo"
          ? `El ACWR ha entrado en zona de riesgo (${ratio.toFixed(2)}), por encima de la banda óptima (${bandas.bajo}–${bandas.alto}).`
          : `El ACWR está en zona insuficiente (${ratio.toFixed(2)}), por debajo de la banda óptima (${bandas.bajo}–${bandas.alto}).`,
      fecha: atleta.acwr[ultimoIdx].semana,
      enlace: `/atletas/${atleta.id}`,
    },
  ];
}

/** Regla 6a: 3 semanas seguidas en zona óptima de ACWR (severidad "info"). */
export function hallazgosRachaAcwr(atleta: Atleta, umbrales: UmbralesConfig): Hallazgo[] {
  const agudos = atleta.acwr.map((c) => c.agudo);
  if (agudos.length < 3) return [];

  const bandas = { bajo: umbrales.acwrBajo, alto: umbrales.acwrAlto };
  const ultimosTresIdx = [agudos.length - 3, agudos.length - 2, agudos.length - 1];
  const todasOptimas = ultimosTresIdx.every((idx) => {
    const cronica = cargaCronica(agudos, idx);
    const ratio = acwr(agudos[idx], cronica);
    return ratio !== null && zonaAcwr(ratio, bandas) === "optima";
  });
  if (!todasOptimas) return [];

  return [
    {
      id: `hallazgo-racha-acwr-${atleta.id}`,
      atletaId: atleta.id,
      severidad: "info",
      titulo: "Racha de carga estable",
      detalle: "3 semanas seguidas en zona óptima de ACWR.",
      fecha: atleta.acwr[agudos.length - 1].semana,
      enlace: `/atletas/${atleta.id}`,
    },
  ];
}
