"use client";

import { useMemo, useState } from "react";
import { ChevronDown, IdCard, SlidersHorizontal, UserCog } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadarPerfil } from "@/components/charts";
import { AtletaAvatar } from "@/components/atletas/atleta-avatar";
import { AtletaMenu } from "@/components/atletas/atleta-menu";
import { CampoEditable } from "@/components/atletas/campo-editable";
import { estadoReadiness } from "@/components/atletas/readiness-utils";
import { colorSemaforo, colorSemaforoTexto } from "@/lib/calculations";
import { useStateColors } from "@/lib/theme";
import { edadDesde, fmtFechaCorta, fmtFechaLarga } from "@/components/atletas/ficha/fecha-utils";
import {
  accionActualizar,
  useConfig,
  useDispatch,
  useEntrenador,
  useFaseDeAtleta,
  useReadinessActual,
  useResumenAtleta,
  useSesionesDeAtleta,
  type Atleta,
  type Capacidad,
  type MetricaFicha,
  type Sesion,
} from "@/lib/store";

const ESTADO_ATLETA_LABEL: Record<Atleta["estado"], string> = {
  activo: "Activo",
  alta: "Alta",
  pausa: "Pausa",
};

const VENTANA_ADHERENCIA_DIAS = 28;
const MIN_METRICAS = 3;
const MAX_METRICAS = 5;
const MIN_EJES_RADAR = 3;

const METRICAS_DISPONIBLES: { id: MetricaFicha; label: string }[] = [
  { id: "readiness", label: "Readiness" },
  { id: "dolor", label: "Dolor" },
  { id: "carga-semanal", label: "Carga semanal" },
  { id: "acwr", label: "ACWR" },
  { id: "simetria", label: "Simetría" },
  { id: "adherencia", label: "Adherencia" },
  { id: "semana-proceso", label: "Semana del proceso" },
  { id: "proxima-sesion", label: "Próxima sesión" },
];

/** % de sesiones completadas (sobre el total programado) en los últimos 28 días. */
function calcularAdherencia(sesiones: Sesion[], hoy: Date): number | null {
  const inicio = new Date(hoy);
  inicio.setDate(inicio.getDate() - (VENTANA_ADHERENCIA_DIAS - 1));

  const enVentana = sesiones.filter((s) => {
    const fecha = new Date(`${s.fecha}T00:00:00`);
    return fecha >= inicio && fecha <= hoy;
  });
  if (enVentana.length === 0) return null;

  const completadas = enVentana.filter((s) => s.estado === "completada").length;
  return (completadas / enVentana.length) * 100;
}

/** Sesión "programada" más próxima a partir de hoy (incluido), la más cercana primero. */
function proximaSesionProgramada(sesiones: Sesion[], hoy: Date): Sesion | null {
  const hoyIso = hoy.toISOString().slice(0, 10);
  const futuras = sesiones
    .filter((s) => s.estado === "programada" && s.fecha >= hoyIso)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
  return futuras[0] ?? null;
}

type Tono = "good" | "bad" | "neutral";

/** Chip compacto label+valor de la fila de métricas — deliberadamente sin card propia (evita apilar bordes). */
function MetricaChip({
  label,
  value,
  unit,
  tono,
}: {
  label: string;
  value: string;
  unit?: string;
  tono?: Tono;
}) {
  const estado = useStateColors();
  const color = tono === "good" ? estado.good : tono === "bad" ? estado.bad : undefined;
  return (
    <div className="min-w-[74px]">
      <p className="truncate text-[10px] font-medium uppercase tracking-wide text-textDim">{label}</p>
      <p className="mt-0.5 font-display text-lg font-bold leading-none text-textStrong" style={color ? { color } : undefined}>
        {value}
        {unit && <span className="ml-0.5 text-[11px] font-normal text-textDim">{unit}</span>}
      </p>
    </div>
  );
}

/** Popover de checkboxes para elegir qué métricas se muestran en el header — persiste en `config.fichaMetricas` (global, todos los atletas). */
function SelectorMetricas({
  seleccionadas,
  onChange,
}: {
  seleccionadas: string[];
  onChange: (next: string[]) => void;
}) {
  function toggle(id: MetricaFicha) {
    const activa = seleccionadas.includes(id);
    if (activa && seleccionadas.length <= MIN_METRICAS) return;
    if (!activa && seleccionadas.length >= MAX_METRICAS) return;
    onChange(activa ? seleccionadas.filter((m) => m !== id) : [...seleccionadas, id]);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Elegir métricas visibles"
          className="flex shrink-0 items-center gap-1 self-start rounded-full border border-borderSoft p-1.5 text-textDim transition-colors hover:border-brand/50 hover:text-textStrong"
        >
          <SlidersHorizontal className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <p className="mb-2 text-xs text-textDim">
          Entre {MIN_METRICAS} y {MAX_METRICAS} métricas. Se aplica a todos los atletas.
        </p>
        <div className="space-y-0.5">
          {METRICAS_DISPONIBLES.map((m) => {
            const activa = seleccionadas.includes(m.id);
            const bloqueada =
              (activa && seleccionadas.length <= MIN_METRICAS) || (!activa && seleccionadas.length >= MAX_METRICAS);
            return (
              <label
                key={m.id}
                className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-bg"
              >
                <input
                  type="checkbox"
                  checked={activa}
                  onChange={() => toggle(m.id)}
                  disabled={bloqueada}
                  className="size-4 shrink-0 accent-brand disabled:opacity-40"
                />
                <span className="truncate text-sm text-textStrong">{m.label}</span>
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Popover de checkboxes para elegir qué ejes del radar se muestran (mínimo 3) — estado LOCAL, preferencia de vista puntual. */
function SelectorEjesRadar({
  ejesDisponibles,
  seleccionados,
  onChange,
}: {
  ejesDisponibles: Capacidad[];
  seleccionados: Capacidad[];
  onChange: (next: Capacidad[]) => void;
}) {
  function toggle(eje: Capacidad) {
    const activo = seleccionados.includes(eje);
    if (activo && seleccionados.length <= MIN_EJES_RADAR) return;
    onChange(activo ? seleccionados.filter((e) => e !== eje) : [...seleccionados, eje]);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1 rounded-full border border-borderSoft px-2 py-0.5 text-[10px] font-medium text-textDim transition-colors hover:border-brand/50 hover:text-textStrong"
        >
          Capacidades
          <span className="rounded-full bg-brand-tint px-1.5 py-0.5 text-[10px] font-semibold text-brand-ink">
            {seleccionados.length}/{ejesDisponibles.length}
          </span>
          <ChevronDown className="size-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <p className="mb-2 text-xs text-textDim">Mínimo {MIN_EJES_RADAR} capacidades.</p>
        <div className="max-h-64 space-y-0.5 overflow-y-auto">
          {ejesDisponibles.map((eje) => {
            const activo = seleccionados.includes(eje);
            return (
              <label
                key={eje}
                className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-bg"
              >
                <input
                  type="checkbox"
                  checked={activo}
                  onChange={() => toggle(eje)}
                  disabled={activo && seleccionados.length <= MIN_EJES_RADAR}
                  className="size-4 shrink-0 accent-brand disabled:opacity-40"
                />
                <span className="truncate text-sm text-textStrong">{eje}</span>
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Badge de fase — color de semáforo si `lesionId`/`faseId` resuelven contra el catálogo; texto legado si no. */
function BadgeFase({ atleta }: { atleta: Atleta }) {
  const faseDe = useFaseDeAtleta(atleta);

  if (!faseDe) {
    return (
      <span className="max-w-[180px] truncate rounded-full border border-borderSoft px-2.5 py-0.5 text-xs font-medium text-textDim">
        Sin fase asignada
      </span>
    );
  }

  const color = colorSemaforo(faseDe.indiceFase, faseDe.totalFases);
  const colorTexto = colorSemaforoTexto(faseDe.indiceFase, faseDe.totalFases);
  return (
    <span
      className="min-w-0 max-w-[200px] rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ background: `${color}1A`, color: colorTexto }}
      title={`${faseDe.tipoLesion.nombre} · ${faseDe.fase.nombre}`}
    >
      <span className="block truncate">{faseDe.fase.nombre}</span>
    </span>
  );
}

/** Badge de entrenador asignado — mismo patrón visual claro-tintado que el resto de badges de la ficha; "Sin asignar" discreto si no hay. */
function BadgeEntrenador({ atleta }: { atleta: Atleta }) {
  const entrenador = useEntrenador(atleta.entrenadorId);

  if (!entrenador) {
    return (
      <span className="flex items-center gap-1 rounded-full border border-dashed border-borderSoft px-2.5 py-0.5 text-xs text-textDim">
        <UserCog className="size-3 shrink-0" />
        Sin asignar
      </span>
    );
  }

  return (
    <span className="flex min-w-0 max-w-[200px] items-center gap-1 rounded-full bg-brand-tint px-2.5 py-0.5 text-xs font-medium text-brand-ink">
      <UserCog className="size-3 shrink-0" />
      <span className="block truncate">{entrenador.nombre}</span>
    </span>
  );
}

/** Popover "Ver datos completos" — contacto, fechas y detalle clínico que no caben en el header compacto. */
function DatosCompletosPopover({ atleta }: { atleta: Atleta }) {
  const dispatch = useDispatch();

  function guardar(patch: Partial<Atleta>) {
    dispatch(accionActualizar("atletas", atleta.id, patch));
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Ver datos completos"
          title="Ver datos completos"
          className="flex shrink-0 items-center gap-1.5 rounded-md p-2 text-textDim transition-colors hover:bg-bg hover:text-textStrong"
        >
          <IdCard className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <p className="mb-1 text-xs font-semibold text-textStrong">Contacto, fechas y detalle clínico</p>
        <div>
          <CampoEditable
            label="Email"
            value={atleta.email ?? ""}
            tipo="email"
            placeholder="atleta@example.com"
            onGuardar={(v) => guardar({ email: v || undefined })}
          />
          <CampoEditable
            label="Teléfono"
            value={atleta.telefono ?? ""}
            tipo="tel"
            placeholder="+34 600 000 000"
            onGuardar={(v) => guardar({ telefono: v || undefined })}
          />
          <CampoEditable
            label="Fecha de nacimiento"
            value={atleta.fechaNacimiento ?? ""}
            tipo="date"
            formatoDisplay={fmtFechaLarga}
            onGuardar={(v) => guardar({ fechaNacimiento: v || undefined })}
          />
          <CampoEditable
            label="Inicio de tratamiento"
            value={atleta.fechaInicioTratamiento ?? ""}
            tipo="date"
            formatoDisplay={fmtFechaLarga}
            onGuardar={(v) => guardar({ fechaInicioTratamiento: v || undefined })}
          />
          <CampoEditable
            label="Detalle de la lesión"
            value={atleta.lesionDetalle ?? ""}
            tipo="textarea"
            onGuardar={(v) => guardar({ lesionDetalle: v || undefined })}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Header compacto de la ficha (FASE 4) — fusiona lo esencial del antiguo
 * `DatosGeneralesFicha`: identidad + semáforo de fase + entrenador a la
 * izquierda, fila de métricas SELECCIONABLES (`config.fichaMetricas`, 3-5) al
 * centro, radar compacto a la derecha. El resto de datos personales/clínicos
 * (contacto, fechas, detalle de la lesión) vive en el popover "Ver datos
 * completos" — es lo que menos ruido mete sin perder el dato (alternativa
 * descartada: colarlo al principio del tab Anamnesis, que ya tiene su propio
 * contenido). Debe caber sin obligar a hacer scroll para ver los tabs en un
 * portátil de 1366×768 — de ahí que las métricas sean chips sin card propia y
 * el radar use `compact` (ver `RadarPerfil`).
 */
export function FichaHeader({ atleta }: { atleta: Atleta }) {
  const resumen = useResumenAtleta(atleta.id);
  const sesiones = useSesionesDeAtleta(atleta.id);
  const readiness = useReadinessActual(atleta.id);
  const config = useConfig();
  const dispatch = useDispatch();
  const { umbrales } = config;

  const hoy = useMemo(() => new Date(), []);
  const adherencia = useMemo(() => calcularAdherencia(sesiones, hoy), [sesiones, hoy]);
  const proximaSesion = useMemo(() => proximaSesionProgramada(sesiones, hoy), [sesiones, hoy]);

  const ejesDisponibles = useMemo(() => atleta.perfilFisico.map((p) => p.eje), [atleta.perfilFisico]);
  const [ejesSeleccionados, setEjesSeleccionados] = useState<Capacidad[]>(ejesDisponibles);

  const edad = atleta.fechaNacimiento ? edadDesde(atleta.fechaNacimiento) : null;
  const cargaSemanal = atleta.acwr[atleta.acwr.length - 1]?.agudo ?? null;

  const metricasValores: Record<MetricaFicha, { label: string; value: string; unit?: string; tono?: Tono }> = useMemo(() => {
    const readinessPct = readiness !== null ? Math.round(readiness * 10) : null;
    const readinessTono: Tono | undefined =
      readinessPct !== null
        ? estadoReadiness(readinessPct) === "bien"
          ? "good"
          : estadoReadiness(readinessPct) === "atencion"
            ? "neutral"
            : "bad"
        : undefined;

    const dolor = resumen?.dolorActual;
    const dolorTono: Tono | undefined = dolor !== undefined ? (dolor <= 2 ? "good" : dolor <= 5 ? "neutral" : "bad") : undefined;

    const ratioAcwr = resumen?.ratioAcwr ?? null;
    const zonaAcwr = resumen?.zonaAcwr ?? null;
    const acwrTono: Tono | undefined = zonaAcwr
      ? zonaAcwr === "optima"
        ? "good"
        : zonaAcwr === "riesgo"
          ? "bad"
          : "neutral"
      : undefined;

    const simetriaMedia = resumen?.simetriaMedia ?? null;
    const simetriaTono: Tono | undefined =
      simetriaMedia !== null
        ? simetriaMedia >= umbrales.simetriaObjetivo
          ? "good"
          : simetriaMedia >= umbrales.simetriaAceptable
            ? "neutral"
            : "bad"
        : undefined;

    const adherenciaTono: Tono | undefined =
      adherencia !== null ? (adherencia >= 80 ? "good" : adherencia >= 50 ? "neutral" : "bad") : undefined;

    return {
      readiness: {
        label: "Readiness",
        value: readinessPct !== null ? `${readinessPct}` : "N/D",
        unit: readinessPct !== null ? "%" : undefined,
        tono: readinessTono,
      },
      dolor: {
        label: "Dolor",
        value: dolor !== undefined ? `${dolor}` : "N/D",
        unit: dolor !== undefined ? "/10" : undefined,
        tono: dolorTono,
      },
      "carga-semanal": {
        label: "Carga semanal",
        value: cargaSemanal !== null ? cargaSemanal.toFixed(0) : "N/D",
        unit: cargaSemanal !== null ? "sRPE" : undefined,
      },
      acwr: {
        label: "ACWR",
        value: ratioAcwr !== null ? ratioAcwr.toFixed(2) : "N/D",
        tono: acwrTono,
      },
      simetria: {
        label: "Simetría",
        value: simetriaMedia !== null ? simetriaMedia.toFixed(0) : "N/D",
        unit: simetriaMedia !== null ? "%" : undefined,
        tono: simetriaTono,
      },
      adherencia: {
        label: "Adherencia",
        value: adherencia !== null ? adherencia.toFixed(0) : "N/D",
        unit: adherencia !== null ? "%" : undefined,
        tono: adherenciaTono,
      },
      "semana-proceso": {
        label: "Semana del proceso",
        value: `${atleta.semanaProceso}`,
      },
      "proxima-sesion": {
        label: "Próxima sesión",
        value: proximaSesion ? fmtFechaCorta(proximaSesion.fecha) : "—",
      },
    };
  }, [readiness, resumen, cargaSemanal, adherencia, proximaSesion, atleta.semanaProceso, umbrales]);

  return (
    <div className="mb-6 flex flex-wrap items-start gap-x-8 gap-y-5 lg:flex-nowrap lg:items-center">
      <div className="flex items-start gap-3">
        <AtletaAvatar atleta={atleta} size="lg" />
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-textStrong">{atleta.nombre}</h1>
          <p className="mt-0.5 text-sm text-textDim">
            {atleta.deporte}
            {edad !== null && ` · ${edad} años`} · {ESTADO_ATLETA_LABEL[atleta.estado]}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <BadgeFase atleta={atleta} />
            <BadgeEntrenador atleta={atleta} />
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-wrap items-end gap-x-5 gap-y-3 lg:min-w-[260px]">
        {config.fichaMetricas.map((id) => {
          const m = metricasValores[id as MetricaFicha];
          if (!m) return null;
          return <MetricaChip key={id} label={m.label} value={m.value} unit={m.unit} tono={m.tono} />;
        })}
        <SelectorMetricas
          seleccionadas={config.fichaMetricas}
          onChange={(next) => dispatch({ type: "CONFIG_ACTUALIZAR", payload: { fichaMetricas: next } })}
        />
      </div>

      <div className="flex shrink-0 items-start gap-2">
        <div className="w-80">
          {atleta.perfilFisico.length > 0 ? (
            <RadarPerfil
              perfilFisico={atleta.perfilFisico}
              sexo={atleta.sexo}
              ejesVisibles={ejesSeleccionados}
              compact
              accionExtra={
                <SelectorEjesRadar
                  ejesDisponibles={ejesDisponibles}
                  seleccionados={ejesSeleccionados}
                  onChange={setEjesSeleccionados}
                />
              }
            />
          ) : (
            <div className="flex h-full min-h-[140px] items-center justify-center rounded-xl border border-dashed border-borderSoft p-4 text-center">
              <p className="text-xs text-textDim">Sin medidas suficientes para el radar de perfil físico.</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <DatosCompletosPopover atleta={atleta} />
          <AtletaMenu atleta={atleta} />
        </div>
      </div>
    </div>
  );
}
