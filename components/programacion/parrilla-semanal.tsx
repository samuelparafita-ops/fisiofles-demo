"use client";

import { useMemo, useState } from "react";
import { CalendarRange, ChevronLeft, ChevronRight, HeartPulse, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { SelectorFiltro, type OpcionFiltro } from "@/components/dashboard/selector-filtro";
import { AtletaAvatar } from "@/components/atletas/atleta-avatar";
import { NuevaSesionDialog } from "@/components/atletas/ficha/nueva-sesion-dialog";
import { SesionDetalleDialog } from "@/components/atletas/ficha/sesion-detalle-dialog";
import { ChipIntensidad } from "@/components/programacion/intensidad-chip";
import { addDias, fmtFechaCorta, hoyIso, inicioSemana, toIso } from "@/components/atletas/ficha/fecha-utils";
import { cn } from "@/lib/utils";
import { colorSemaforo } from "@/lib/calculations";
import {
  resolverFaseDeAtleta,
  useAtletas,
  useEntrenadores,
  useSesiones,
  useTiposLesion,
  type Sesion,
} from "@/lib/store";

const DIAS_CORTOS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const SIN_ASIGNAR = "sin-asignar";

const selectClass =
  "flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

/**
 * Parrilla semanal (modo por defecto de /programacion): filas = atletas
 * activos filtrados, columnas = L-D de la semana navegable. Reutiliza
 * `NuevaSesionDialog`/`SesionDetalleDialog` — el mismo store que Calendario y
 * el tab Programación de la ficha, así que crear/editar aquí se refleja allí.
 */
export function ParrillaSemanal() {
  const atletas = useAtletas();
  const entrenadores = useEntrenadores();
  const tiposLesion = useTiposLesion();
  const sesiones = useSesiones();

  const [cursor, setCursor] = useState(() => new Date());
  const [busqueda, setBusqueda] = useState("");
  const [entrenadorFiltro, setEntrenadorFiltro] = useState("todos");
  const [lesionesSel, setLesionesSel] = useState<string[]>([]);
  const [sesionSeleccionada, setSesionSeleccionada] = useState<Sesion | null>(null);

  const activos = useMemo(() => atletas.filter((a) => a.estado === "activo"), [atletas]);

  // Mismo criterio que el filtro "Lesión" de /dashboard: solo lesiones con
  // algún atleta activo asignado.
  const lesionesDisponibles = useMemo(() => {
    const idsPresentes = new Set(activos.map((a) => a.lesionId).filter((id): id is string => id !== undefined));
    return tiposLesion.filter((t) => idsPresentes.has(t.id));
  }, [activos, tiposLesion]);
  const lesionesOpciones: OpcionFiltro[] = useMemo(
    () => lesionesDisponibles.map((t) => ({ value: t.id, label: t.nombre })),
    [lesionesDisponibles]
  );

  const atletasFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return activos.filter((a) => {
      const matchBusqueda = !q || a.nombre.toLowerCase().includes(q);
      const matchEntrenador =
        entrenadorFiltro === "todos" ||
        (entrenadorFiltro === SIN_ASIGNAR ? !a.entrenadorId : a.entrenadorId === entrenadorFiltro);
      const matchLesion = lesionesSel.length === 0 || (a.lesionId !== undefined && lesionesSel.includes(a.lesionId));
      return matchBusqueda && matchEntrenador && matchLesion;
    });
  }, [activos, busqueda, entrenadorFiltro, lesionesSel]);

  const inicio = useMemo(() => inicioSemana(cursor), [cursor]);
  const dias = useMemo(() => Array.from({ length: 7 }, (_, i) => addDias(inicio, i)), [inicio]);
  const hoy = hoyIso();

  const sesionesPorCelda = useMemo(() => {
    const mapa = new Map<string, Sesion[]>();
    for (const s of sesiones) {
      const key = `${s.atletaId}__${s.fecha}`;
      const lista = mapa.get(key) ?? [];
      lista.push(s);
      mapa.set(key, lista);
    }
    return mapa;
  }, [sesiones]);

  const haySesionesEnSemana = useMemo(
    () => atletasFiltrados.some((a) => dias.some((d) => (sesionesPorCelda.get(`${a.id}__${toIso(d)}`) ?? []).length > 0)),
    [atletasFiltrados, dias, sesionesPorCelda]
  );

  function navegar(delta: number) {
    setCursor((c) => addDias(c, delta * 7));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navegar(-1)} aria-label="Semana anterior">
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>
            Hoy
          </Button>
          <Button variant="outline" size="icon" onClick={() => navegar(1)} aria-label="Semana siguiente">
            <ChevronRight className="size-4" />
          </Button>
          <span className="text-sm font-medium text-textStrong">
            {fmtFechaCorta(toIso(inicio))} – {fmtFechaCorta(toIso(dias[6]))}
          </span>
        </div>

        <div className="ml-auto w-full sm:w-auto sm:max-w-xs">
          <Input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar atleta..."
          />
        </div>

        <select value={entrenadorFiltro} onChange={(e) => setEntrenadorFiltro(e.target.value)} className={selectClass}>
          <option value="todos">Todos los entrenadores</option>
          <option value={SIN_ASIGNAR}>Sin asignar</option>
          {entrenadores.map((en) => (
            <option key={en.id} value={en.id}>
              {en.nombre}
            </option>
          ))}
        </select>

        <SelectorFiltro
          label="Lesión"
          icon={HeartPulse}
          opciones={lesionesOpciones}
          seleccionados={lesionesSel}
          onChange={setLesionesSel}
        />
      </div>

      <div className="flex flex-wrap items-center gap-1.5 text-xs text-textDim">
        <span>Semáforo de fase:</span>
        <span className="flex items-center gap-1">
          <span className="size-2.5 rounded-full" style={{ background: colorSemaforo(0, 2) }} aria-hidden />
          Inicio del proceso
        </span>
        <ChevronRight className="size-3" />
        <span className="flex items-center gap-1">
          <span className="size-2.5 rounded-full" style={{ background: colorSemaforo(1, 2) }} aria-hidden />
          Rendimiento
        </span>
      </div>

      {atletasFiltrados.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title="Ningún atleta coincide con estos filtros"
          description="Ajusta la búsqueda, el entrenador o la lesión seleccionada."
        />
      ) : (
        <div className="space-y-2">
          {!haySesionesEnSemana && (
            <p className="rounded-lg border border-dashed border-borderSoft bg-bg px-3 py-2 text-xs text-textDim">
              Esta semana no tiene sesiones programadas todavía. Pasa el ratón sobre una celda y pulsa “+” para crear la primera.
            </p>
          )}
          <div className="overflow-x-auto rounded-xl border border-borderSoft bg-surface2 shadow-sm">
            <table className="w-full min-w-[880px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-borderSoft bg-bg text-left text-xs uppercase tracking-wide text-textDim">
                  <th className="w-48 px-4 py-2.5 font-medium">Atleta</th>
                  {dias.map((d, i) => (
                    <th
                      key={i}
                      className={cn("px-2 py-2.5 text-center font-medium", toIso(d) === hoy && "text-brand-ink")}
                    >
                      {DIAS_CORTOS[i]} {d.getDate()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {atletasFiltrados.map((atleta) => {
                  const faseDe = resolverFaseDeAtleta(atleta, tiposLesion);
                  const colorFase = faseDe ? colorSemaforo(faseDe.indiceFase, faseDe.totalFases) : undefined;
                  return (
                    <tr key={atleta.id} className="border-b border-borderSoft last:border-b-0">
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-2">
                          <AtletaAvatar atleta={atleta} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-textStrong">{atleta.nombre}</p>
                            <p className="truncate text-xs text-textDim">{atleta.deporte}</p>
                          </div>
                        </div>
                      </td>
                      {dias.map((d, i) => {
                        const fecha = toIso(d);
                        const sesionesCelda = sesionesPorCelda.get(`${atleta.id}__${fecha}`) ?? [];
                        return (
                          <td
                            key={i}
                            className="group relative min-w-[120px] min-h-[56px] border-l border-borderSoft px-1.5 py-1.5 align-top"
                          >
                            <div className="space-y-1">
                              {sesionesCelda.map((s) => (
                                <button
                                  key={s.id}
                                  type="button"
                                  onClick={() => setSesionSeleccionada(s)}
                                  className="block w-full rounded-md border-l-[3px] bg-bg px-2 py-1 text-left transition-colors hover:bg-brand-tint/50"
                                  style={{ borderLeftColor: colorFase ?? "transparent" }}
                                >
                                  <p className="truncate text-xs font-medium text-textStrong">{s.nombre}</p>
                                  <div className="mt-1 flex flex-wrap items-center gap-1">
                                    {s.tipo && (
                                      <span className="rounded-full border border-borderSoft px-1.5 py-0 text-[10px] text-textDim">
                                        {s.tipo}
                                      </span>
                                    )}
                                    {s.rpeObjetivo !== undefined && <ChipIntensidad rpe={s.rpeObjetivo} />}
                                  </div>
                                </button>
                              ))}
                            </div>
                            <NuevaSesionDialog
                              atletaId={atleta.id}
                              fechaPorDefecto={fecha}
                              trigger={
                                <button
                                  type="button"
                                  aria-label={`Añadir sesión el ${fecha} para ${atleta.nombre}`}
                                  className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-brand text-white opacity-0 shadow transition-opacity group-hover:opacity-100"
                                >
                                  <Plus className="size-3.5" />
                                </button>
                              }
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {sesionSeleccionada && (
        <SesionDetalleDialog sesion={sesionSeleccionada} onClose={() => setSesionSeleccionada(null)} />
      )}
    </div>
  );
}
