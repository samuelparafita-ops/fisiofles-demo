import type { Atleta, Sesion } from "@/lib/store/types";
import type { Hallazgo } from "./tipos";

const DIAS_VENTANA = 7;

/** Regla 5: atleta activo sin sesiones (no canceladas) en los próximos 7 días. */
export function hallazgosSesiones(atleta: Atleta, sesiones: Sesion[], ahora: Date): Hallazgo[] {
  if (atleta.estado !== "activo") return [];

  const limite = new Date(ahora);
  limite.setDate(limite.getDate() + DIAS_VENTANA);

  const hayProximas = sesiones.some((s) => {
    if (s.atletaId !== atleta.id || s.estado === "cancelada") return false;
    const fecha = new Date(`${s.fecha}T00:00:00`);
    return fecha >= ahora && fecha <= limite;
  });
  if (hayProximas) return [];

  return [
    {
      id: `hallazgo-sin-sesiones-${atleta.id}`,
      atletaId: atleta.id,
      severidad: "atencion",
      titulo: "Sin sesiones programadas",
      detalle: `No hay sesiones programadas en los próximos ${DIAS_VENTANA} días.`,
      fecha: ahora.toISOString().slice(0, 10),
      enlace: `/atletas/${atleta.id}`,
    },
  ];
}
