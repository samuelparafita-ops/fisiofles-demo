# CLAUDE.md — Fisiofles Demo

## Qué es esto
Demo clicable de Fisiofles: plataforma de seguimiento y análisis para readaptación
deportiva. Es un PROTOTIPO para enseñar a fisioterapeutas, NO producción.

## Reglas duras
- Sin backend, sin base de datos, sin auth real. Todo es mock en `lib/mock/`.
- El store se persiste en `localStorage` bajo la clave única `fisiofles-demo-v2`
  (ver `lib/store/`). Hay una acción "Restablecer demo" (menú del avatar) que
  borra esa clave y re-siembra desde `lib/mock/seed.ts`.
- Única fuente de verdad: todo dato editable vive en el store (`lib/store/`).
  Ningún componente importa datos de `lib/mock/` directamente; los mocks son
  solo la SEMILLA inicial del store. Una misma entidad (ej: la sesión del
  jueves) debe poder editarse desde cualquier vista donde aparezca y
  reflejarse en todas las demás.
- Los umbrales de cálculo (bandas ACWR, objetivo de simetría), las métricas
  visibles y el tema de color se leen SIEMPRE de la config del store
  (`state.config`), nunca hardcodeados.
- No inventes funcionalidades fuera del alcance de la fase actual.
- Nunca escribas recomendaciones clínicas automáticas. La app MUESTRA, el profesional DECIDE.
- Todos los datos de pacientes son ficticios. Añade marca "Demo · datos ficticios" visible.

## Motor de cálculo (CRÍTICO)
- Las fórmulas de los gráficos están especificadas en `docs/formulas-dashboard.md`. Es la FUENTE DE VERDAD.
- Implementación en `lib/calculations/` como funciones PURAS (sin React, sin estado), con tests.
- Los datos mock guardan valores BRUTOS; las fórmulas se aplican en tiempo de render llamando a `lib/calculations/`. El dashboard calcula de verdad, no pinta números fijos.
- No cambies una fórmula sin que yo lo pida. Si algo no cuadra con `docs/formulas-dashboard.md`, para y pregunta.

## Estética (UI clara — sin "cockpit" por defecto)
- Base clara: fondo `bg` (#F6F7F9), cards blancas con borde `borderSoft` y sombra sutil.
  Los 4 gráficos (`components/charts/`) usan `ChartPanel`: UN único contenedor claro,
  el gráfico apoya directamente sobre `surface2`. Ya no hay panel oscuro interior por
  defecto — ver `components/charts/chart-panel.tsx`.
- Paleta de datos de los gráficos: `dataLight.*` (cyan/rojo/verde/naranja/gris con
  contraste AA sobre blanco), consumida SIEMPRE vía `useChartColors()` (`lib/theme.ts`),
  nunca importando `colors.data`/`colors.dataLight` directamente en un componente de
  gráfico. Los colores PUROS del Excel (`data.*`, saturados, sin contraste sobre blanco)
  se conservan solo como reserva del tema "clasico-excel" (panel `chartBg`, activable
  desde Personalización en una fase posterior) — no se usan en el tema por defecto.
- Color de marca: cyan `brand` #1DC4EB para acentos grandes / estado activo. NO sirve
  para texto ni para trazos de gráfico sobre blanco (contraste ~2:1). Para TEXTO y
  enlaces cyan sobre fondo claro usa `brandInk` (#0B96B8); para líneas/marcas de gráfico
  usa `dataLight.primary` vía el hook.
- Tipografía: Space Grotesk para números/titulares, Inter para texto.
- Los tokens de color están en `lib/tokens.ts`. Úsalos SIEMPRE, no hardcodees hex sueltos.

## Convenciones de código
- TypeScript estricto. Componentes funcionales.
- Gráficos con Recharts, siempre dentro de `components/charts/`.
- Componentes shadcn/ui para UI base; personalizados en `components/`.
- Nombres de datos y UI en español (es el idioma del producto).
- Comenta poco pero nombra bien.

## Stack
Next.js 14 (App Router) · TypeScript · Tailwind · shadcn/ui · Recharts · lucide-react

## Deploy
Vercel. `vercel deploy`. La demo debe funcionar sin variables de entorno.
