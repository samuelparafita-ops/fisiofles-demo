const MS_POR_DIA = 24 * 60 * 60 * 1000;

/**
 * Tiempo relativo a granularidad de día: `Notificacion.fecha` es una fecha
 * (yyyy-mm-dd) sin hora, así que no hay precisión horaria real que ofrecer.
 */
export function tiempoRelativo(fechaIso: string, ahora: Date = new Date()): string {
  const fecha = new Date(`${fechaIso}T00:00:00`);
  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  const dias = Math.round((hoy.getTime() - fecha.getTime()) / MS_POR_DIA);

  if (dias <= 0) return "Hoy";
  if (dias === 1) return "Ayer";
  if (dias < 7) return `Hace ${dias} días`;
  if (dias < 30) {
    const semanas = Math.floor(dias / 7);
    return `Hace ${semanas} semana${semanas > 1 ? "s" : ""}`;
  }
  const meses = Math.floor(dias / 30);
  return `Hace ${meses} mes${meses > 1 ? "es" : ""}`;
}
