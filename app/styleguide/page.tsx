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
          dark
          title="Datos — puros (SOLO dentro de paneles chartBg)"
          note="Nunca sobre fondo claro: sin contraste suficiente, fatigan la vista."
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
          title="Cockpit — superficie de los paneles de gráfico"
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
            valueColor="strong"
            variation={{ label: "+3% vs. objetivo", tone: "good", direction: "up" }}
          />
          <StatCard
            label="Días hasta el alta"
            value="14"
            variation={{ label: "-2 vs. plan", tone: "neutral", direction: "down" }}
          />
        </div>
      </section>

      {/* Chart cockpit */}
      <section className="mt-14 space-y-4 border-t border-borderSoft pt-10">
        <h2 className="font-display text-lg font-bold text-textStrong">
          Panel de gráfico (cockpit)
        </h2>
        <p className="text-sm text-muted-foreground">
          Los paneles de gráfico son la única superficie donde viven los
          colores puros de <code className="text-xs">data.*</code>. El resto
          de la UI se mantiene clara.
        </p>
        <div className="rounded-xl border border-chartGrid bg-chartBg p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white">ACWR · últimas 8 semanas</p>
            <span className="text-xs text-chartText">chartBg #181C20</span>
          </div>
          <div className="relative mt-6 h-32 border-b border-l border-chartGrid">
            <div className="absolute inset-x-0 top-1/3 border-t border-dashed border-chartGrid" />
            <svg
              className="absolute inset-0 h-full w-full overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              <polyline
                points="0,70 15,55 30,60 45,40 60,45 75,25 90,30 100,20"
                fill="none"
                stroke={colors.data.primary}
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              <polyline
                points="0,50 15,50 30,50 45,50 60,50 75,50 90,50 100,50"
                fill="none"
                stroke={colors.data.base}
                strokeDasharray="4 3"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-chartText">
            <span className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full"
                style={{ background: colors.data.primary }}
              />
              Actual
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full"
                style={{ background: colors.data.base }}
              />
              Base
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full"
                style={{ background: colors.data.good }}
              />
              Zona óptima
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full"
                style={{ background: colors.data.warn }}
              />
              Riesgo moderado
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full"
                style={{ background: colors.data.compare }}
              />
              Déficit
            </span>
          </div>
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
