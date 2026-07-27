import { Sparkles } from "lucide-react";
import { colors } from "@/lib/tokens";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadarPerfil, AcwrChart, SimetriaBar, EvolucionLine } from "@/components/charts";

const SAMPLE_PERFIL = [
  { eje: "Fuerza explosiva" as const, inicial: 34, actual: 39, objetivo: 1.2 },
  { eje: "Altura salto CMJ" as const, inicial: 36, actual: 41, objetivo: 1.0 },
  { eje: "Fuerza máxima" as const, inicial: 1.6, actual: 1.9, objetivo: 1.0 },
  { eje: "Velocidad máxima" as const, inicial: 6.9, actual: 7.2, objetivo: 0.8 },
  { eje: "Agilidad-COD" as const, inicial: 2.5, actual: 2.35, objetivo: -0.5 },
  { eje: "RSA" as const, inicial: 21, actual: 23, objetivo: 1.0 },
];

const SAMPLE_ACWR = [
  { semana: "S1", agudo: 300 },
  { semana: "S2", agudo: 320 },
  { semana: "S3", agudo: 340 },
  { semana: "S4", agudo: 360 },
  { semana: "S5", agudo: 250 },
  { semana: "S6", agudo: 480 },
  { semana: "S7", agudo: 400 },
  { semana: "S8", agudo: 420 },
];

const SAMPLE_SIMETRIAS = [
  { test: "Fuerza cuádriceps", izq: 210, der: 245 },
  { test: "Isquiotibiales", izq: 150, der: 210 },
  { test: "Salto unipodal", izq: 38, der: 36 },
  { test: "Hop test", izq: 88, der: 92 },
];

const SAMPLE_EVOLUCION = [
  { fecha: "2026-06-01", dolor: 6, carga: 420, rpe: 7 },
  { fecha: "2026-06-08", dolor: 4, carga: 460, rpe: 6 },
  { fecha: "2026-06-15", dolor: 3, carga: 500, rpe: 6 },
  { fecha: "2026-06-22", dolor: 2, carga: 480, rpe: 5 },
  { fecha: "2026-06-29", dolor: 1, carga: 520, rpe: 5 },
  { fecha: "2026-07-06", dolor: 0, carga: 540, rpe: 4 },
];

function Swatch({ name, hex }: { name: string; hex: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-borderSoft bg-surface2 p-3 shadow-sm">
      <div
        className="size-10 shrink-0 rounded-lg border border-borderSoft"
        style={{ background: hex }}
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {name}
        </p>
        <p className="font-mono text-xs text-muted-foreground">{hex}</p>
      </div>
    </div>
  );
}

function DarkSwatch({ name, hex }: { name: string; hex: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-chartGrid bg-chartBg p-3">
      <div
        className="size-10 shrink-0 rounded-lg border border-chartGrid"
        style={{ background: hex }}
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-white">{name}</p>
        <p className="font-mono text-xs text-chartText">{hex}</p>
      </div>
    </div>
  );
}

function SwatchGroup({
  title,
  note,
  swatches,
  dark = false,
}: {
  title: string;
  note?: string;
  swatches: { name: string; hex: string }[];
  dark?: boolean;
}) {
  const SwatchComp = dark ? DarkSwatch : Swatch;
  return (
    <div>
      <h3 className="font-display text-sm font-bold uppercase tracking-wide text-textDim">
        {title}
      </h3>
      {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {swatches.map((s) => (
          <SwatchComp key={s.name} name={s.name} hex={s.hex} />
        ))}
      </div>
    </div>
  );
}

export default function StyleguidePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <PageHeader
        title="Styleguide"
        description="Sistema de diseño — colores, tipografía y componentes compartidos. Borrar antes de producción."
      />

      {/* Colores */}
      <section className="space-y-8">
        <SwatchGroup
          title="Marca"
          swatches={[
            { name: "brand", hex: colors.brand },
            { name: "brandLight", hex: colors.brandLight },
            { name: "brandTint", hex: colors.brandTint },
            { name: "brandInk", hex: colors.brandInk },
            { name: "brandDeep", hex: colors.brandDeep },
          ]}
        />
        <SwatchGroup
          title="Estados — texto/badges sobre fondo claro"
          swatches={[
            { name: "state.good", hex: colors.state.good },
            { name: "state.warn", hex: colors.state.warn },
            { name: "state.bad", hex: colors.state.bad },
          ]}
        />
        <SwatchGroup
          title="Neutros — base clara"
          swatches={[
            { name: "bg", hex: colors.bg },
            { name: "surface1 / surface2", hex: colors.surface1 },
            { name: "border", hex: colors.border },
            { name: "borderSoft", hex: colors.borderSoft },
            { name: "muted", hex: colors.muted },
            { name: "textDim", hex: colors.textDim },
            { name: "text", hex: colors.text },
            { name: "textStrong", hex: colors.textStrong },
          ]}
        />
        <SwatchGroup
          title="dataLight — paleta de datos (tema fisiofles, por defecto)"
          note="Serie de los 4 gráficos vía useChartColors(). Contraste AA (≥3:1) verificado sobre blanco."
          swatches={[
            { name: "dataLight.primary", hex: colors.dataLight.primary },
            { name: "dataLight.compare", hex: colors.dataLight.compare },
            { name: "dataLight.good", hex: colors.dataLight.good },
            { name: "dataLight.warn", hex: colors.dataLight.warn },
            { name: "dataLight.base", hex: colors.dataLight.base },
          ]}
        />
        <SwatchGroup
          dark
          title="data — puros del Excel (reservado: tema clasico-excel)"
          note="Ya no se usan por defecto. Activables desde Personalización (fase posterior) junto al panel chartBg."
          swatches={[
            { name: "data.primary", hex: colors.data.primary },
            { name: "data.compare", hex: colors.data.compare },
            { name: "data.good", hex: colors.data.good },
            { name: "data.warn", hex: colors.data.warn },
            { name: "data.base", hex: colors.data.base },
          ]}
        />
        <SwatchGroup
          dark
          title="Cockpit — superficie del tema clasico-excel"
          swatches={[
            { name: "chartBg", hex: colors.chartBg },
            { name: "chartGrid", hex: colors.chartGrid },
            { name: "chartText", hex: colors.chartText },
          ]}
        />
      </section>

      {/* Tipografía */}
      <section className="mt-14 space-y-4 border-t border-borderSoft pt-10">
        <h2 className="font-display text-lg font-bold text-textStrong">
          Tipografía
        </h2>
        <div className="space-y-3 rounded-xl border border-borderSoft bg-surface2 p-6 shadow-sm">
          <h1 className="font-display text-4xl font-bold tracking-tight text-textStrong">
            H1 · Space Grotesk 700
          </h1>
          <h2 className="font-display text-2xl font-bold tracking-tight text-textStrong">
            H2 · Space Grotesk 700
          </h2>
          <h3 className="font-display text-lg font-medium text-text">
            H3 · Space Grotesk 500
          </h3>
          <p className="font-display text-5xl font-bold text-brand-ink">
            128.4
            <span className="ml-2 text-lg font-medium text-muted-foreground">
              número de métrica · Space Grotesk · brandInk (contrasta en claro)
            </span>
          </p>
          <p className="text-base text-text">
            Texto de cuerpo en Inter 400 — usado para párrafos, labels y
            contenido general de la interfaz.
          </p>
          <p className="text-base font-medium text-text">
            Inter 500 — énfasis medio, subtítulos de sección.
          </p>
          <p className="text-base font-semibold text-text">
            Inter 600 — títulos de card, botones.
          </p>
          <p className="text-sm text-muted-foreground">
            Inter 400, muted — texto secundario, ayudas y descripciones.
          </p>
        </div>
      </section>

      {/* StatCard */}
      <section className="mt-14 space-y-4 border-t border-borderSoft pt-10">
        <h2 className="font-display text-lg font-bold text-textStrong">
          StatCard
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="ACWR actual" value="1.12" unit="ratio" />
          <StatCard
            label="Carga aguda"
            value="842"
            unit="UA"
            variation={{ label: "+12% vs. semana previa", tone: "bad", direction: "up" }}
          />
          <StatCard
            label="Simetría cuádriceps"
            value="97"
            unit="%"
            variation={{ label: "+3% vs. objetivo", tone: "good", direction: "up" }}
          />
          <StatCard
            label="Días hasta el alta"
            value="14"
            variation={{ label: "-2 vs. plan", tone: "neutral", direction: "down" }}
          />
        </div>
      </section>

      {/* Gráficos v2 (claro) */}
      <section className="mt-14 space-y-4 border-t border-borderSoft pt-10">
        <h2 className="font-display text-lg font-bold text-textStrong">
          Gráficos v2 — ChartPanel claro
        </h2>
        <p className="text-sm text-muted-foreground">
          Un único contenedor claro (<code className="text-xs">surface2</code> +{" "}
          <code className="text-xs">borderSoft</code>), sin panel oscuro interior.
          Datos de ejemplo — los colores de serie vienen de{" "}
          <code className="text-xs">useChartColors()</code> (tema activo, por
          defecto <code className="text-xs">dataLight</code>).
        </p>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <RadarPerfil perfilFisico={SAMPLE_PERFIL} sexo="Hombre" />
          <AcwrChart cargas={SAMPLE_ACWR} />
          <SimetriaBar simetrias={SAMPLE_SIMETRIAS} />
          <EvolucionLine evolucion={SAMPLE_EVOLUCION} />
        </div>
      </section>

      {/* PageHeader */}
      <section className="mt-14 space-y-4 border-t border-borderSoft pt-10">
        <h2 className="font-display text-lg font-bold text-textStrong">
          PageHeader
        </h2>
        <div className="rounded-xl border border-borderSoft bg-surface2 p-6 shadow-sm">
          <PageHeader
            title="Título de página"
            description="Subtítulo opcional con contexto adicional."
          />
        </div>
      </section>

      {/* EmptyState */}
      <section className="mt-14 space-y-4 border-t border-borderSoft pt-10">
        <h2 className="font-display text-lg font-bold text-textStrong">
          EmptyState
        </h2>
        <EmptyState
          icon={Sparkles}
          title="Sin resultados"
          description="Aquí va el texto de ayuda cuando no hay datos que mostrar."
        />
      </section>

      {/* Badges + Card, para contexto */}
      <section className="mt-14 space-y-4 border-t border-borderSoft pt-10 pb-24">
        <h2 className="font-display text-lg font-bold text-textStrong">
          Card + Badge (referencia)
        </h2>
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle className="font-display">Card de ejemplo</CardTitle>
            <CardDescription>
              rounded-xl, borde borderSoft, sombra sutil.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Badge>default</Badge>
            <Badge variant="secondary">secondary</Badge>
            <Badge variant="destructive">destructive</Badge>
            <Badge variant="outline">outline</Badge>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
