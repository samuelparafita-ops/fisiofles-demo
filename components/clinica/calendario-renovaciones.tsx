"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStateColors, type StateColors } from "@/lib/theme";
import { addDias, hoyIso, toIso } from "@/components/atletas/ficha/fecha-utils";
import { NotaDiaForm, type NotaDiaValor } from "./nota-dia-form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  accionActualizar,
  accionCrear,
  accionEliminar,
  useAtletas,
  useDispatch,
  useNotasCalendario,
  type Atleta,
  type NotaCalendario,
  type Suscripcion,
} from "@/lib/store";

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

function fmtDiaCompleto(d: Date): string {
  const raw = d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function nuevoIdNota(): string {
  return `notacal-${Date.now().toString(36)}-${Math.round(Math.random() * 1e4).toString(36)}`;
}

/**
 * Celda de un día del calendario — Popover con renovaciones (enlazan al
 * atleta, comportamiento heredado) + notas del día (alta/edición/borrado,
 * `notasCalendario` de FASE 1) + botón "Añadir nota". Componente propio (en
 * vez de renderizarlo inline en el `.map()` del grid) porque necesita su
 * propio estado local de "añadiendo"/"editando".
 */
function DiaCelda({
  fecha,
  iso,
  enMes,
  esHoy,
  renovacionesDia,
  notasDia,
  atletas,
  estado,
}: {
  fecha: Date;
  iso: string;
  enMes: boolean;
  esHoy: boolean;
  renovacionesDia: Renovacion[];
  notasDia: NotaCalendario[];
  atletas: Atleta[];
  estado: StateColors;
}) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [anadiendo, setAnadiendo] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  function crearNota(valor: NotaDiaValor) {
    dispatch(accionCrear("notasCalendario", { id: nuevoIdNota(), fecha: iso, ...valor }));
    setAnadiendo(false);
  }

  function actualizarNota(id: string, valor: NotaDiaValor) {
    dispatch(accionActualizar("notasCalendario", id, valor));
    setEditandoId(null);
  }

  function eliminarNota(id: string) {
    dispatch(accionEliminar("notasCalendario", id));
  }

  return (
    <Popover
      onOpenChange={(open) => {
        if (!open) {
          setAnadiendo(false);
          setEditandoId(null);
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex min-h-[92px] w-full flex-col items-start bg-surface2 p-1.5 text-left transition-colors hover:bg-bg",
            !enMes && "opacity-40"
          )}
        >
          <div className="flex w-full items-center justify-between">
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                esHoy ? "bg-brand text-white" : "text-textStrong"
              )}
            >
              {fecha.getDate()}
            </span>
            {notasDia.length > 0 && <span className="size-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />}
          </div>
          <div className="mt-1 w-full space-y-1">
            {renovacionesDia.map(({ atleta, suscripcion, diasRestantes }) => {
              const proximo = diasRestantes <= UMBRAL_PROXIMO_DIAS;
              return (
                <span
                  key={atleta.id}
                  title={`${atleta.nombre} · ${suscripcion.plan}`}
                  className={cn(
                    "block w-full truncate rounded px-1 py-0.5 text-left text-[10px] font-semibold",
                    !proximo && "bg-borderSoft text-textDim"
                  )}
                  style={proximo ? { background: `${estado.warn}1A`, color: estado.warn } : undefined}
                >
                  {atleta.avatarInitials}
                </span>
              );
            })}
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="start">
        <p className="mb-3 font-display text-sm font-bold text-textStrong">{fmtDiaCompleto(fecha)}</p>

        {renovacionesDia.length > 0 && (
          <div className="mb-3">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-textDim">Renovaciones</p>
            <ul className="space-y-1">
              {renovacionesDia.map(({ atleta, suscripcion }) => (
                <li key={atleta.id}>
                  <button
                    type="button"
                    onClick={() => router.push(`/atletas/${atleta.id}`)}
                    className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-bg"
                  >
                    <span className="font-medium text-textStrong">{atleta.nombre}</span>
                    <span className="text-xs text-textDim">{suscripcion.plan}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-textDim">Notas</p>
            {!anadiendo && (
              <button
                type="button"
                onClick={() => setAnadiendo(true)}
                className="flex items-center gap-1 text-xs font-medium text-brand-ink transition-opacity hover:opacity-80"
              >
                <Plus className="size-3" />
                Añadir nota
              </button>
            )}
          </div>

          {notasDia.length === 0 && !anadiendo && <p className="text-xs text-textDim">Sin notas este día.</p>}

          {notasDia.length > 0 && (
            <ul className="space-y-1.5">
              {notasDia.map((nota) => {
                const atletaNota = nota.atletaId ? atletas.find((a) => a.id === nota.atletaId) : undefined;
                if (editandoId === nota.id) {
                  return (
                    <li key={nota.id}>
                      <NotaDiaForm
                        atletas={atletas}
                        valorInicial={{ texto: nota.texto, atletaId: nota.atletaId }}
                        onGuardar={(v) => actualizarNota(nota.id, v)}
                        onCancelar={() => setEditandoId(null)}
                      />
                    </li>
                  );
                }
                return (
                  <li key={nota.id} className="rounded-lg border border-borderSoft bg-bg p-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 whitespace-pre-wrap text-sm text-text">{nota.texto}</p>
                      <div className="flex shrink-0 items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => setEditandoId(nota.id)}
                          aria-label="Editar nota"
                          className="rounded p-1 text-textDim transition-colors hover:text-textStrong"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => eliminarNota(nota.id)}
                          aria-label="Eliminar nota"
                          className="rounded p-1 text-textDim transition-colors hover:text-state-bad"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                    {atletaNota && (
                      <button
                        type="button"
                        onClick={() => router.push(`/atletas/${atletaNota.id}`)}
                        className="mt-1 text-xs font-medium text-brand-ink hover:underline"
                      >
                        {atletaNota.nombre}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {anadiendo && (
            <div className="mt-1.5">
              <NotaDiaForm atletas={atletas} onGuardar={crearNota} onCancelar={() => setAnadiendo(false)} />
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Calendario mensual propio (sin dependencias nuevas) — bloque b) del FASE 8, interactivo desde FASE 7. */
export function CalendarioRenovaciones({ renovaciones }: { renovaciones: Renovacion[] }) {
  const estado = useStateColors();
  const atletas = useAtletas();
  const notas = useNotasCalendario();
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

  const notasPorFecha = useMemo(() => {
    const mapa = new Map<string, NotaCalendario[]>();
    for (const n of notas) {
      const lista = mapa.get(n.fecha) ?? [];
      lista.push(n);
      mapa.set(n.fecha, lista);
    }
    return mapa;
  }, [notas]);

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
          return (
            <DiaCelda
              key={iso}
              fecha={d}
              iso={iso}
              enMes={d.getMonth() === mesActual}
              esHoy={iso === hoyIsoStr}
              renovacionesDia={porFecha.get(iso) ?? []}
              notasDia={notasPorFecha.get(iso) ?? []}
              atletas={atletas}
              estado={estado}
            />
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-4 text-[11px] text-textDim">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ background: estado.warn }} aria-hidden="true" />
          Renovación próxima
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
          Nota
        </span>
      </div>
    </div>
  );
}
