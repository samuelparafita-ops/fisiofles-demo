"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, List, Search, UserX } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AtletaCard } from "@/components/atletas/atleta-card";
import { AtletasTabla } from "@/components/atletas/atletas-tabla";
import { NuevoAtletaDialog } from "@/components/atletas/nuevo-atleta-dialog";
import { CajaHallazgos } from "@/components/atletas/caja-hallazgos";
import {
  useAtletas,
  useCatalogoTests,
  useConfig,
  useDispatch,
  useEntrenadores,
  useFormulariosEnvios,
  useRegistrosTests,
  useSesiones,
  useTiposLesion,
  type EstadoAtleta,
} from "@/lib/store";
import { generarHallazgos } from "@/lib/insights";

const ESTADO_FILTROS: { value: EstadoAtleta | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "activo", label: "Activos" },
  { value: "alta", label: "Alta" },
  { value: "pausa", label: "Pausa" },
];

const selectClass =
  "flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

const SIN_ASIGNAR_FILTRO = "sin-asignar";

export default function AtletasPage() {
  const atletas = useAtletas();
  const entrenadores = useEntrenadores();
  const tiposLesion = useTiposLesion();
  const sesiones = useSesiones();
  const registrosTests = useRegistrosTests();
  const catalogoTests = useCatalogoTests();
  const formulariosEnvios = useFormulariosEnvios();
  const config = useConfig();
  const dispatch = useDispatch();

  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoAtleta | "todos">("todos");
  const [lesionFiltro, setLesionFiltro] = useState<string>("todas");
  const [entrenadorFiltro, setEntrenadorFiltro] = useState<string>("todos");

  // Mismo criterio derivado que /dashboard y /programacion: solo tipos de
  // lesión con al menos un atleta asignado. La fase ya no es filtrable "en
  // global" — desde v4 cada fase pertenece a UNA lesión, así que "Fase 3" no
  // significa lo mismo en dos procesos distintos; el badge de cada fila la
  // muestra con su color de semáforo.
  const lesionesDisponibles = useMemo(() => {
    const presentes = new Set(atletas.map((a) => a.lesionId).filter(Boolean));
    return tiposLesion.filter((t) => presentes.has(t.id));
  }, [atletas, tiposLesion]);

  const atletasFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return atletas.filter((a) => {
      const matchBusqueda = !q || a.nombre.toLowerCase().includes(q);
      const matchEstado = estadoFiltro === "todos" || a.estado === estadoFiltro;
      const matchLesion = lesionFiltro === "todas" || a.lesionId === lesionFiltro;
      const matchEntrenador =
        entrenadorFiltro === "todos" ||
        (entrenadorFiltro === SIN_ASIGNAR_FILTRO ? !a.entrenadorId : a.entrenadorId === entrenadorFiltro);
      return matchBusqueda && matchEstado && matchLesion && matchEntrenador;
    });
  }, [busqueda, atletas, estadoFiltro, lesionFiltro, entrenadorFiltro]);

  const hallazgos = useMemo(
    () =>
      generarHallazgos({
        atletas,
        sesiones,
        registrosTests,
        catalogoTests,
        formulariosEnvios,
        config,
      }),
    [atletas, sesiones, registrosTests, catalogoTests, formulariosEnvios, config]
  );
  const hallazgosPlantilla = useMemo(
    () => hallazgos.filter((h) => h.severidad === "atencion" || h.severidad === "critico"),
    [hallazgos]
  );

  function setVista(vista: "grid" | "lista") {
    dispatch({ type: "CONFIG_ACTUALIZAR", payload: { vistaAtletas: vista } });
  }

  return (
    <>
      <PageHeader
        title="Atletas"
        description="Seguimiento y análisis de readaptación deportiva."
      />

      <CajaHallazgos
        hallazgos={hallazgosPlantilla}
        titulo="Hallazgos de la plantilla"
        mostrarAtleta
        className="mb-6"
        vacioTitulo="Sin hallazgos activos"
        vacioDescripcion="No hay hallazgos de atención o críticos en la plantilla ahora mismo."
      />

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar atleta por nombre..."
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {ESTADO_FILTROS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setEstadoFiltro(f.value)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  estadoFiltro === f.value
                    ? "border-brand bg-brand-tint text-brand-ink"
                    : "border-borderSoft text-textDim hover:border-brand/50"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <select
            value={lesionFiltro}
            onChange={(e) => setLesionFiltro(e.target.value)}
            className={selectClass}
          >
            <option value="todas">Todas las lesiones</option>
            {lesionesDisponibles.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>

          <select
            value={entrenadorFiltro}
            onChange={(e) => setEntrenadorFiltro(e.target.value)}
            className={selectClass}
          >
            <option value="todos">Todos los entrenadores</option>
            <option value={SIN_ASIGNAR_FILTRO}>Sin asignar</option>
            {entrenadores.map((en) => (
              <option key={en.id} value={en.id}>
                {en.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 rounded-lg border border-borderSoft bg-bg p-0.5">
            <button
              type="button"
              onClick={() => setVista("grid")}
              aria-label="Vista de tarjetas"
              className={cn(
                "flex size-8 items-center justify-center rounded-md transition-colors",
                config.vistaAtletas === "grid"
                  ? "bg-surface2 text-brand-ink shadow-sm"
                  : "text-textDim hover:text-textStrong"
              )}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setVista("lista")}
              aria-label="Vista de lista"
              className={cn(
                "flex size-8 items-center justify-center rounded-md transition-colors",
                config.vistaAtletas === "lista"
                  ? "bg-surface2 text-brand-ink shadow-sm"
                  : "text-textDim hover:text-textStrong"
              )}
            >
              <List className="size-4" />
            </button>
          </div>

          <NuevoAtletaDialog />
        </div>
      </div>

      {atletasFiltrados.length === 0 ? (
        <EmptyState
          icon={UserX}
          title="Sin resultados"
          description="No hay ningún atleta que coincida con los filtros seleccionados."
        />
      ) : config.vistaAtletas === "lista" ? (
        <AtletasTabla atletas={atletasFiltrados} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {atletasFiltrados.map((atleta) => (
            <AtletaCard key={atleta.id} atleta={atleta} />
          ))}
        </div>
      )}
    </>
  );
}
