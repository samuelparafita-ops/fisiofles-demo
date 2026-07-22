"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarCheck2,
  CalendarX,
  Check,
  CheckCircle2,
  ClipboardList,
  Frown,
  Scale,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { ActividadPlantillaChart } from "@/components/charts";
import { useToast } from "@/components/shared/toast";
import {
  accionActualizar,
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
import { colors } from "@/lib/tokens";

const NOMBRE_PROFESIONAL = "Álex";

function saludoSegunHora(hora: number) {
  if (hora < 12) return "Buenos días";
  if (hora < 20) return "Buenas tardes";
  return "Buenas noches";
}

function isoLocal(d: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function semanasDesde(fechaIso: string, hoy: Date) {
  const inicio = new Date(`${fechaIso}T00:00:00`);
  const dias = (hoy.getTime() - inicio.getTime()) / 86_400_000;
  return dias / 7;
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

const COLOR_SEVERIDAD: Record<HallazgoRelevante["severidad"], string> = {
  critico: colors.state.bad,
  atencion: colors.state.warn,
};

function SesionHoyRow({ sesion }: { sesion: Sesion }) {
  const atleta = useAtleta(sesion.atletaId);
  const dispatch = useDispatch();
  const toast = useToast();

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
            {sesion.nombre} · {sesion.ejercicios.length} ejercicios
          </p>
        </div>
      </div>

      {sesion.estado === "programada" ? (
        <Button size="sm" variant="outline" className="shrink-0" onClick={marcarCompletada}>
          <Check className="size-3.5" />
          Marcar completada
        </Button>
      ) : sesion.estado === "completada" ? (
        <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-state-good">
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
  const color = COLOR_SEVERIDAD[hallazgo.severidad];

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

  const ahora = useMemo(() => new Date(), []);
  const hoyIso = isoLocal(ahora);
  const sesionesHoy = useSesionesDelDia(hoyIso);

  const activos = useMemo(() => atletas.filter((a) => a.estado === "activo"), [atletas]);

  const retencionSemanas = useMemo(() => {
    const semanas = activos
      .map((a) => a.fechaInicioTratamiento)
      .filter((f): f is string => Boolean(f))
      .map((f) => semanasDesde(f, ahora));
    if (semanas.length === 0) return null;
    return semanas.reduce((acc, s) => acc + s, 0) / semanas.length;
  }, [activos, ahora]);

  const revisionesHoy = useMemo(
    () => sesionesHoy.filter((s) => s.estado === "programada"),
    [sesionesHoy]
  );
  const completadasHoy = useMemo(
    () => sesionesHoy.filter((s) => s.estado === "completada"),
    [sesionesHoy]
  );

  const alertasSinRevisar = useMemo(
    () => notificaciones.filter((n) => n.tipo === "alerta" && !n.leida),
    [notificaciones]
  );

  const sesionesHoyOrdenadas = useMemo(
    () =>
      [...sesionesHoy].sort((a, b) => {
        const porEstado = ORDEN_ESTADO_SESION[a.estado] - ORDEN_ESTADO_SESION[b.estado];
        if (porEstado !== 0) return porEstado;
        return a.nombre.localeCompare(b.nombre);
      }),
    [sesionesHoy]
  );

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

  const alertasDelDia = useMemo(() => {
    const relevantes = hallazgos.filter(
      (h): h is HallazgoRelevante => h.severidad === "critico" || h.severidad === "atencion"
    );
    return [...relevantes]
      .sort((a, b) => ORDEN_SEVERIDAD[a.severidad] - ORDEN_SEVERIDAD[b.severidad])
      .slice(0, 6);
  }, [hallazgos]);

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
        <p className="mt-2 text-sm text-foreground">
          <span className="font-semibold text-textStrong">{revisionesHoy.length}</span> sesiones hoy
          <span className="mx-1.5 text-border">·</span>
          <span className="font-semibold text-textStrong">{alertasSinRevisar.length}</span> alertas sin
          revisar
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Atletas activos"
          value={activos.length}
          variation={{ label: `${atletas.length} en la plantilla`, tone: "neutral" }}
        />
        <StatCard
          label="Retención media"
          value={retencionSemanas !== null ? retencionSemanas.toFixed(1) : "N/D"}
          unit={retencionSemanas !== null ? "sem." : undefined}
        />
        <StatCard
          label="Revisiones hoy"
          value={revisionesHoy.length}
          variation={
            completadasHoy.length > 0
              ? { label: `${completadasHoy.length} completada(s) ya`, tone: "good" }
              : undefined
          }
        />
        <StatCard
          label="Alertas sin revisar"
          value={alertasSinRevisar.length}
          variation={{
            label: alertasSinRevisar.length > 0 ? "Requieren revisión" : "Todo revisado",
            tone: alertasSinRevisar.length > 0 ? "bad" : "good",
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-borderSoft bg-surface2 p-6 shadow-sm">
          <h2 className="font-display text-base font-bold text-textStrong">Hoy</h2>
          {sesionesHoyOrdenadas.length > 0 ? (
            <div className="mt-1 divide-y divide-borderSoft">
              {sesionesHoyOrdenadas.map((s) => (
                <SesionHoyRow key={s.id} sesion={s} />
              ))}
            </div>
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

        <section className="rounded-xl border border-borderSoft bg-surface2 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-textStrong">Alertas del día</h2>
            {alertasDelDia.length > 0 && (
              <span className="rounded-full bg-state-bad/10 px-2 py-0.5 text-xs font-semibold text-state-bad">
                {alertasDelDia.length}
              </span>
            )}
          </div>
          {alertasDelDia.length > 0 ? (
            <div className="mt-1 divide-y divide-borderSoft">
              {alertasDelDia.map((h) => (
                <HallazgoRow key={h.id} hallazgo={h} />
              ))}
            </div>
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
        <ActividadPlantillaChart
          atletas={activos.map((a) => ({ id: a.id, acwr: a.acwr }))}
          umbrales={{ bajo: config.umbrales.acwrBajo, alto: config.umbrales.acwrAlto }}
        />
      </div>
    </>
  );
}
