"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  CalendarCheck2,
  CalendarX,
  Check,
  CheckCircle2,
  ChartNoAxesCombined,
  ChevronDown,
  ClipboardList,
  Frown,
  LayoutTemplate,
  Scale,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/shared/toast";
import { cn } from "@/lib/utils";
import {
  accionActualizar,
  totalEjerciciosSesion,
  useAtleta,
  useAtletas,
  useCatalogoTests,
  useConfig,
  useDispatch,
  useFormulariosEnvios,
  useNotificaciones,
  useRegistrosTests,
  useSesiones,
  useSesionesDelDia,
  type Sesion,
} from "@/lib/store";
import { generarHallazgos, type Hallazgo, type SeveridadHallazgo } from "@/lib/insights";
import { useStateColors } from "@/lib/theme";

const NOMBRE_PROFESIONAL = "Álex";
const LIMITE_VISIBLE = 3;

function saludoSegunHora(hora: number) {
  if (hora < 12) return "Buenos días";
  if (hora < 20) return "Buenas tardes";
  return "Buenas noches";
}

function isoLocal(d: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const ORDEN_ESTADO_SESION: Record<Sesion["estado"], number> = {
  programada: 0,
  completada: 1,
  cancelada: 2,
};

type HallazgoRelevante = Hallazgo & { severidad: Exclude<SeveridadHallazgo, "info"> };

const ORDEN_SEVERIDAD: Record<HallazgoRelevante["severidad"], number> = {
  critico: 0,
  atencion: 1,
};

const ICONOS_HALLAZGO: { prefijo: string; icon: LucideIcon }[] = [
  { prefijo: "hallazgo-acwr-", icon: Activity },
  { prefijo: "hallazgo-dolor-", icon: Frown },
  { prefijo: "hallazgo-sin-sesiones-", icon: CalendarX },
  { prefijo: "hallazgo-simetria-", icon: Scale },
  { prefijo: "hallazgo-formulario-", icon: ClipboardList },
];

function iconoDeHallazgo(id: string): LucideIcon {
  return ICONOS_HALLAZGO.find((h) => id.startsWith(h.prefijo))?.icon ?? AlertTriangle;
}

// Accesos rápidos a las secciones clave.
const ACCESOS_RAPIDOS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: ChartNoAxesCombined },
  { href: "/atletas", label: "Atletas", icon: Users },
  { href: "/plantillas", label: "Plantillas", icon: LayoutTemplate },
  { href: "/formularios", label: "Formularios", icon: ClipboardList },
  { href: "/clinica", label: "Clínica", icon: Briefcase },
];

function AccesoRapidoCard({ href, label, icon: Icon }: { href: string; label: string; icon: LucideIcon }) {
  return (
    <Link
      href={href}
      className="flex min-w-0 items-center gap-3 rounded-xl border border-borderSoft bg-surface2 p-4 shadow-sm transition-colors hover:border-brand hover:bg-brand-tint"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand-ink">
        <Icon className="size-4" />
      </div>
      <span className="truncate font-display text-sm font-bold text-textStrong">{label}</span>
    </Link>
  );
}

function BotonMostrarMas({
  expandido,
  resto,
  onClick,
}: {
  expandido: boolean;
  resto: number;
  onClick: () => void;
}) {
  if (resto <= 0) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-1 flex w-full items-center justify-center gap-1 py-2 text-xs font-medium text-textDim hover:text-textStrong"
    >
      {expandido ? "Mostrar menos" : `Mostrar ${resto} más`}
      <ChevronDown className={cn("size-3.5 transition-transform", expandido && "rotate-180")} />
    </button>
  );
}

function SesionHoyRow({ sesion }: { sesion: Sesion }) {
  const atleta = useAtleta(sesion.atletaId);
  const dispatch = useDispatch();
  const toast = useToast();
  const estado = useStateColors();

  if (!atleta) return null;

  function marcarCompletada() {
    dispatch(accionActualizar("sesiones", sesion.id, { estado: "completada" }));
    toast("Sesión marcada como completada", `${sesion.nombre} · ${atleta!.nombre}`);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href={`/atletas/${atleta.id}`}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-tint font-display text-xs font-bold text-brand-ink transition-colors hover:bg-brand hover:text-white"
        >
          {atleta.avatarInitials}
        </Link>
        <div className="min-w-0">
          <Link
            href={`/atletas/${atleta.id}`}
            className="font-display text-sm font-bold text-textStrong hover:text-brand-ink"
          >
            {atleta.nombre}
          </Link>
          <p className="truncate text-xs text-textDim">
            {sesion.nombre} · {totalEjerciciosSesion(sesion)} ejercicios
          </p>
        </div>
      </div>

      {sesion.estado === "programada" ? (
        <Button size="sm" variant="outline" className="shrink-0" onClick={marcarCompletada}>
          <Check className="size-3.5" />
          Marcar completada
        </Button>
      ) : sesion.estado === "completada" ? (
        <span
          className="flex shrink-0 items-center gap-1.5 text-xs font-medium"
          style={{ color: estado.good }}
        >
          <CheckCircle2 className="size-3.5" />
          Completada
        </span>
      ) : (
        <span className="shrink-0 text-xs font-medium text-textDim">Cancelada</span>
      )}
    </div>
  );
}

function HallazgoRow({ hallazgo }: { hallazgo: HallazgoRelevante }) {
  const atleta = useAtleta(hallazgo.atletaId);
  const Icon = iconoDeHallazgo(hallazgo.id);
  const estado = useStateColors();
  const colorPorSeveridad: Record<HallazgoRelevante["severidad"], string> = {
    critico: estado.bad,
    atencion: estado.warn,
  };
  const color = colorPorSeveridad[hallazgo.severidad];

  return (
    <Link href={hallazgo.enlace} className="group flex items-start gap-3 py-3">
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-full"
        style={{ background: `${color}1A`, color }}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-textStrong group-hover:text-brand-ink">
          {atleta?.nombre ?? "Atleta"} · {hallazgo.titulo}
        </p>
        <p className="mt-0.5 line-clamp-1 text-xs text-textDim">{hallazgo.detalle}</p>
      </div>
    </Link>
  );
}

export default function InicioPage() {
  const atletas = useAtletas();
  const sesiones = useSesiones();
  const registrosTests = useRegistrosTests();
  const catalogoTests = useCatalogoTests();
  const formulariosEnvios = useFormulariosEnvios();
  const notificaciones = useNotificaciones();
  const config = useConfig();
  const estado = useStateColors();

  const [sesionesExpandido, setSesionesExpandido] = useState(false);
  const [alertasExpandido, setAlertasExpandido] = useState(false);

  const ahora = useMemo(() => new Date(), []);
  const hoyIso = isoLocal(ahora);
  const sesionesHoy = useSesionesDelDia(hoyIso);

  const revisionesHoy = useMemo(
    () => sesionesHoy.filter((s) => s.estado === "programada"),
    [sesionesHoy]
  );
  const completadasHoy = useMemo(
    () => sesionesHoy.filter((s) => s.estado === "completada"),
    [sesionesHoy]
  );

  // "Tareas de hoy" agrega dos bandejas de trabajo pendiente del fisio: las
  // notificaciones tipo "tarea" abiertas (no tienen fecha de vencimiento, son
  // pendientes en curso, no solo de hoy) y las sesiones de hoy sin completar.
  // El nº de completadas solo cuenta sesiones (las notificaciones no guardan
  // cuándo se completaron, así que no se pueden atribuir "a hoy").
  const tareasNotifPendientes = useMemo(
    () => notificaciones.filter((n) => n.tipo === "tarea" && !n.completada).length,
    [notificaciones]
  );
  const tareasPendientes = tareasNotifPendientes + revisionesHoy.length;

  const sesionesHoyOrdenadas = useMemo(
    () =>
      [...sesionesHoy].sort((a, b) => {
        const porEstado = ORDEN_ESTADO_SESION[a.estado] - ORDEN_ESTADO_SESION[b.estado];
        if (porEstado !== 0) return porEstado;
        return a.nombre.localeCompare(b.nombre);
      }),
    [sesionesHoy]
  );
  const sesionesVisibles = sesionesExpandido
    ? sesionesHoyOrdenadas
    : sesionesHoyOrdenadas.slice(0, LIMITE_VISIBLE);
  const restoSesiones = Math.max(0, sesionesHoyOrdenadas.length - LIMITE_VISIBLE);

  const hallazgos = useMemo(
    () =>
      generarHallazgos({
        atletas,
        sesiones,
        registrosTests,
        catalogoTests,
        formulariosEnvios,
        config,
        ahora,
      }),
    [atletas, sesiones, registrosTests, catalogoTests, formulariosEnvios, config, ahora]
  );

  const criticosActivos = useMemo(
    () => hallazgos.filter((h) => h.severidad === "critico").length,
    [hallazgos]
  );

  const alertasDelDia = useMemo(() => {
    const relevantes = hallazgos.filter(
      (h): h is HallazgoRelevante => h.severidad === "critico" || h.severidad === "atencion"
    );
    return [...relevantes]
      .sort((a, b) => ORDEN_SEVERIDAD[a.severidad] - ORDEN_SEVERIDAD[b.severidad])
      .slice(0, 6);
  }, [hallazgos]);
  const alertasVisibles = alertasExpandido ? alertasDelDia : alertasDelDia.slice(0, LIMITE_VISIBLE);
  const restoAlertas = Math.max(0, alertasDelDia.length - LIMITE_VISIBLE);

  const fechaCapitalizada = useMemo(() => {
    const fecha = ahora.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return fecha.charAt(0).toUpperCase() + fecha.slice(1);
  }, [ahora]);

  return (
    <>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-textStrong sm:text-3xl">
          {saludoSegunHora(ahora.getHours())}, {NOMBRE_PROFESIONAL}
        </h1>
        <p className="mt-1 text-sm text-textDim">{fechaCapitalizada}</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/notificaciones" className="block transition-transform hover:-translate-y-0.5">
          <StatCard
            label="Tareas de hoy"
            value={tareasPendientes}
            variation={
              completadasHoy.length > 0
                ? { label: `${completadasHoy.length} completada(s) hoy`, tone: "good" }
                : undefined
            }
          />
        </Link>
        <Link href="#sesiones-hoy" className="block transition-transform hover:-translate-y-0.5">
          <StatCard
            label="Revisiones de hoy"
            value={revisionesHoy.length}
            variation={
              completadasHoy.length > 0
                ? { label: `${completadasHoy.length} completada(s) ya`, tone: "good" }
                : undefined
            }
          />
        </Link>
        <Link href="#alertas-dia" className="block transition-transform hover:-translate-y-0.5">
          <StatCard
            label="Alertas críticas"
            value={criticosActivos}
            variation={{
              label: criticosActivos > 0 ? "Requieren acción" : "Ninguna activa",
              tone: criticosActivos > 0 ? "bad" : "good",
            }}
          />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section id="sesiones-hoy" className="scroll-mt-20 rounded-xl border border-borderSoft bg-surface2 p-6 shadow-sm">
          <h2 className="font-display text-base font-bold text-textStrong">Hoy</h2>
          {sesionesHoyOrdenadas.length > 0 ? (
            <>
              <div className="mt-1 divide-y divide-borderSoft">
                {sesionesVisibles.map((s) => (
                  <SesionHoyRow key={s.id} sesion={s} />
                ))}
              </div>
              <BotonMostrarMas
                expandido={sesionesExpandido}
                resto={restoSesiones}
                onClick={() => setSesionesExpandido((v) => !v)}
              />
            </>
          ) : (
            <div className="mt-3">
              <EmptyState
                icon={CalendarCheck2}
                title="Nada programado para hoy"
                description="No hay sesiones ni revisiones agendadas hoy en la plantilla."
              />
            </div>
          )}
        </section>

        <section id="alertas-dia" className="scroll-mt-20 rounded-xl border border-borderSoft bg-surface2 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-textStrong">Alertas del día</h2>
            {alertasDelDia.length > 0 && (
              <span
                className="rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{ color: estado.bad, background: `${estado.bad}1A` }}
              >
                {alertasDelDia.length}
              </span>
            )}
          </div>
          {alertasDelDia.length > 0 ? (
            <>
              <div className="mt-1 divide-y divide-borderSoft">
                {alertasVisibles.map((h) => (
                  <HallazgoRow key={h.id} hallazgo={h} />
                ))}
              </div>
              <BotonMostrarMas
                expandido={alertasExpandido}
                resto={restoAlertas}
                onClick={() => setAlertasExpandido((v) => !v)}
              />
            </>
          ) : (
            <div className="mt-3">
              <EmptyState
                icon={ShieldCheck}
                title="Sin alertas activas"
                description="No hay hallazgos de atención o críticos en la plantilla ahora mismo."
              />
            </div>
          )}
          <div className="mt-4 border-t border-borderSoft pt-3">
            <Link
              href="/notificaciones"
              className="flex items-center gap-1 text-xs font-medium text-brand-ink hover:underline"
            >
              Ver todas
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </section>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-textDim">
          Accesos rápidos
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {ACCESOS_RAPIDOS.map((a) => (
            <AccesoRapidoCard key={a.href} {...a} />
          ))}
        </div>
      </div>
    </>
  );
}
