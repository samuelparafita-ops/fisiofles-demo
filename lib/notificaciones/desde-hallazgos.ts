/**
 * Puente puro entre el motor de hallazgos (lib/insights) y las notificaciones
 * persistidas del store. El id generado combina regla+atleta (ya codificado
 * en `Hallazgo.id`) con la fecha del hallazgo, para poder deduplicar sin
 * recrear la misma notificación en cada render — ver
 * `components/notificaciones/generador-notificaciones.tsx`.
 */

import type { Hallazgo } from "@/lib/insights";
import type { Notificacion, TipoNotificacion } from "@/lib/store/types";

type ReglaNotificacion = { prefijo: string; tipo: TipoNotificacion; tab: string };

// Mismo orden/criterio de prefijos que `components/atletas/caja-hallazgos.tsx`.
const REGLAS: ReglaNotificacion[] = [
  { prefijo: "hallazgo-racha-acwr-", tipo: "recordatorio", tab: "datos" },
  { prefijo: "hallazgo-racha-simetria-", tipo: "recordatorio", tab: "datos" },
  { prefijo: "hallazgo-acwr-", tipo: "alerta", tab: "datos" },
  { prefijo: "hallazgo-dolor-", tipo: "alerta", tab: "datos" },
  { prefijo: "hallazgo-sin-sesiones-", tipo: "tarea", tab: "calendario" },
  { prefijo: "hallazgo-simetria-", tipo: "alerta", tab: "datos" },
  { prefijo: "hallazgo-formulario-", tipo: "tarea", tab: "formularios" },
];

const REGLA_POR_DEFECTO: ReglaNotificacion = { prefijo: "", tipo: "alerta", tab: "general" };

function reglaDe(hallazgoId: string): ReglaNotificacion {
  return REGLAS.find((r) => hallazgoId.startsWith(r.prefijo)) ?? REGLA_POR_DEFECTO;
}

/** Convierte un hallazgo vivo en la notificación equivalente, con enlace a su tab. */
export function notificacionDesdeHallazgo(hallazgo: Hallazgo): Notificacion {
  const regla = reglaDe(hallazgo.id);

  return {
    id: `notif-${hallazgo.id}-${hallazgo.fecha}`,
    atletaId: hallazgo.atletaId,
    tipo: regla.tipo,
    titulo: hallazgo.titulo,
    detalle: hallazgo.detalle,
    fecha: hallazgo.fecha,
    leida: false,
    completada: false,
    enlace: `/atletas/${hallazgo.atletaId}?tab=${regla.tab}`,
    severidad: hallazgo.severidad,
  };
}
