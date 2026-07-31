# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Fisioterapeutas y readaptadores deportivos que llevan atletas lesionados y quieren
todas las variables de cada atleta bajo control. Usuario tipo: el fisio de la
demo, que viene de gestionar su clínica con hojas de cálculo (Excel REHAB
CREATION). Contexto: clínica / despacho, portátil (~1366×768 como suelo). Uso
diario, entre sesiones con pacientes. Audiencia secundaria: partners e
inversores que ven la demo comercial.

## Product Purpose

Fisiofles es una plataforma de seguimiento y análisis para readaptación
deportiva. Esta build es una DEMO clicable (prototipo, no producción) cuyo éxito
es doble: que el fisio cliente valide el flujo con datos ficticios creíbles, y
que transmita nivel premium en demos comerciales.

## Positioning

La app MUESTRA datos calculados de verdad (ACWR, simetría/LSI, readiness,
intensidad por RPE, semáforo de fases de lesión) desde un motor de fórmulas
espejo de la hoja de cálculo real del profesional; el profesional DECIDE. Nunca
recomendaciones clínicas automáticas. Frente a un SaaS genérico de salud, su
mecanismo es el proceso de readaptación por fases con criterios clínicos del
propio fisio.

## Operating Context

- Flujo demo: entrar → lista de atletas → ficha (7 tabs) → gráficos poblados →
  programación semanal → formulario que actualiza un gráfico.
- Rutas: Inicio, Dashboard, Atletas (+ficha), Programación, Ejercicios,
  Plantillas, Formularios, Notificaciones, Clínica (negocio), Personalización,
  más informe imprimible A4 sin chrome.
- Terminología del cliente: fases de lesión con semáforo rojo→verde, ACWR,
  simetría, readiness, RPE, bloques Low/Moderate/High (en inglés, de su Excel),
  sub-bloques de sesión (Preparación → Activación → Bloque principal).

## Capabilities and Constraints

- Next.js 14 App Router + TypeScript + Tailwind + shadcn/ui + Recharts +
  lucide-react. Sin backend: mock + store en localStorage (`fisiofles-demo-v4`).
- Tokens centralizados: `lib/tokens.ts` espejado en CSS vars
  (`app/globals.css`) y `tailwind.config.ts`; gráficos consumen color solo vía
  `useChartColors()` (`lib/theme.ts`).
- Desktop only. Sin responsive móvil (decisión explícita del rediseño 2026-07).
- Los tabs de la ficha deben verse SIN scroll en 1366×768.
- Informe A4 con ancho fijo 794px, siempre tema claro (`TemaForzado`).
- Semáforo de fases: continuum HSL #980000→#8BF200 derivado en render, hex solo
  en tokens. Los umbrales y métricas visibles se leen de `state.config`.
- Marca visible "Demo · datos ficticios" obligatoria; todos los datos de
  pacientes son ficticios.

## Brand Commitments

- Nombre: Fisiofles. Identidad propia (nada de la marca "Air").
- Cyan como ADN de marca: base #1DC4EB con libertad confirmada para
  evolucionar el tono y construir la paleta alrededor.
- DOS temas gemelos al mismo nivel, claro y oscuro, sin jerarquía entre ellos;
  el tema "clasico-excel" se retira (decisión del rediseño 2026-07).
- Tipografía actual Space Grotesk + Inter; cambiar solo si mejora claramente.
- Copy innegociable: la app muestra, el profesional decide.
- Dirección visual comprometida (2026-07): estándar premium del sector,
  ejecutado limpio y sin ironía. Listón de acabado: VALD Hub y Whoop. Sin
  conceptos temáticos; la marca vive en la precisión del detalle.

## Evidence on Hand

- Fórmulas reales del dashboard en `docs/` (fuente de verdad del motor).
- Semilla mock creíble: 10+ atletas con lesiones, sesiones, tests, formularios.
- Feedback literal del cliente (motivo del rediseño): interfaz "muy básica",
  "se nota mucho que es un diseño convencional hecho por IA", colores "muy
  planos y estériles"; pide algo "más premium, con mejor visual".
- No existen testimonios, clientes, precios ni benchmarks: no inventar.

## Product Principles

1. La app muestra, el profesional decide — cero interpretación clínica
   automática en UI o copy.
2. Una sola fuente de verdad (store); toda entidad editable desde cualquier
   vista se refleja en todas.
3. Los números se calculan en render desde el motor de fórmulas; nunca se
   guardan derivados (intensidad, LSI, color de semáforo).
4. Densidad operativa: el fisio escanea muchas variables por atleta; la
   legibilidad del dato manda sobre la expresión.
5. Premium verificable: contraste AA en ambos temas, jerarquía real, detalle
   artesanal — nada de plantilla por defecto.
