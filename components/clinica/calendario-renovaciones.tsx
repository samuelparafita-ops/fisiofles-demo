"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStateColors } from "@/lib/theme";
import { addDias, hoyIso, toIso } from "@/components/atletas/ficha/fecha-utils";
import type { Atleta, Suscripcion } from "@/lib/store";

export type Renovacion = {
  atleta: Atleta;
  suscripcion: Suscripcion;
  diasRestantes: number;
};

const DIAS_CORTOS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/** Vencimientos a ≤15 días desde hoy se resaltan en el calendario y la lista. */
const UMBRAL_PROXIMO_DIAS = 15;

function inicioSemana(d: Date): Date {
  const copia = new Date(d);
  copia.setHours(0, 0, 0, 0);
  const dia = copia.getDay();
  const diff = dia === 0 ? -6 : 1 - dia;
  copia.setDate(copia.getDate() + diff);
  return copia;
}

/** Calendario mensual propio (sin dependencias nuevas) — bloque b) del FASE 8. */
export function CalendarioRenovaciones({ renovaciones }: { renovaciones: Renovacion[] }) {
  const router = useRouter();
  const estado = useStateColors();
  const [cursor, setCursor] = useState(() => new Date());

  const porFecha = useMemo(() => {
    const mapa = new Map<string, Renovacion[]>();
    for (const r of renovaciones) {
      const lista = mapa.get(r.suscripcion.fechaFin) ?? [];
      lista.push(r);
      mapa.set(r.suscripcion.fechaFin, lista);
    }
    return mapa;
  }, [renovaciones]);

  const primerDiaMes = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const inicioGrid = inicioSemana(primerDiaMes);
  const dias = Array.from({ length: 42 }, (_, i) => addDias(inicioGrid, i));
  const mesActual = cursor.getMonth();
  const hoyIsoStr = hoyIso();
  // No usamos la clase Tailwind `capitalize`: capitaliza cada palabra ("Julio De 2026"),
  // aquí solo queremos la inicial del mes en mayúscula.
  const etiquetaMesRaw = cursor.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  const etiquetaMes = etiquetaMesRaw.charAt(0).toUpperCase() + etiquetaMesRaw.slice(1);

  function navegar(delta: number) {
    setCursor((c) => {
      const d = new Date(c);
      d.setMonth(d.getMonth() + delta);
      return d;
    });
  }

  return (
    <div className="rounded-xl border border-borderSoft bg-surface2 p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-display text-sm font-bold text-textStrong">{etiquetaMes}</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => navegar(-1)}
            aria-label="Mes anterior"
            className="flex size-7 items-center justify-center rounded-md border border-borderSoft text-textDim transition-colors hover:border-brand/50 hover:text-textStrong"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => navegar(1)}
            aria-label="Mes siguiente"
            className="flex size-7 items-center justify-center rounded-md border border-borderSoft text-textDim transition-colors hover:border-brand/50 hover:text-textStrong"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-t-lg border border-b-0 border-borderSoft bg-borderSoft text-center text-[11px] font-semibold uppercase tracking-wide text-textDim">
        {DIAS_CORTOS.map((d) => (
          <div key={d} className="bg-bg py-1.5">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-b-lg border border-borderSoft bg-borderSoft">
        {dias.map((d) => {
          const iso = toIso(d);
          const enMes = d.getMonth() === mesActual;
          const esHoy = iso === hoyIsoStr;
          const items = porFecha.get(iso) ?? [];
          return (
            <div key={iso} className={cn("min-h-[92px] bg-surface2 p-1.5", !enMes && "opacity-40")}>
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                  esHoy ? "bg-brand text-white" : "text-textStrong"
                )}
              >
                {d.getDate()}
              </span>
              <div className="mt-1 space-y-1">
                {items.map(({ atleta, suscripcion, diasRestantes }) => {
                  const proximo = diasRestantes <= UMBRAL_PROXIMO_DIAS;
                  return (
                    <button
                      key={atleta.id}
                      type="button"
                      onClick={() => router.push(`/atletas/${atleta.id}`)}
                      title={`${atleta.nombre} · ${suscripcion.plan}`}
                      className={cn(
                        "block w-full truncate rounded px-1 py-0.5 text-left text-[10px] font-semibold transition-opacity hover:opacity-80",
                        !proximo && "bg-borderSoft text-textDim"
                      )}
                      style={proximo ? { background: `${estado.warn}1A`, color: estado.warn } : undefined}
                    >
                      {atleta.avatarInitials}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
