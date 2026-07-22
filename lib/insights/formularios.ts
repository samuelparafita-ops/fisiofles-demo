import type { FormularioEnvio } from "@/lib/store/types";
import type { Hallazgo } from "./tipos";

const MS_POR_HORA = 60 * 60 * 1000;
const LIMITE_HORAS = 48;

/** Regla 4: `FormularioEnvio` pendiente con más de 48h desde su envío. */
export function hallazgosFormularios(envios: FormularioEnvio[], ahora: Date): Hallazgo[] {
  const hallazgos: Hallazgo[] = [];

  for (const envio of envios) {
    if (envio.estado !== "pendiente") continue;
    const enviado = new Date(`${envio.fechaEnvio}T00:00:00`);
    const horasTranscurridas = (ahora.getTime() - enviado.getTime()) / MS_POR_HORA;
    if (horasTranscurridas <= LIMITE_HORAS) continue;

    hallazgos.push({
      id: `hallazgo-formulario-${envio.id}`,
      atletaId: envio.atletaId,
      severidad: "atencion",
      titulo: "Formulario sin responder",
      detalle: `Lleva ${Math.floor(horasTranscurridas / 24)} día(s) enviado sin respuesta (límite: 48h).`,
      fecha: envio.fechaEnvio,
      enlace: "/formularios",
    });
  }

  return hallazgos;
}
