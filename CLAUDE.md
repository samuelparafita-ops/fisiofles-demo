# CLAUDE.md — Fisiofles Demo

## Qué es esto
Demo clicable de Fisiofles: plataforma de seguimiento y análisis para readaptación
deportiva. Es un PROTOTIPO para enseñar a fisioterapeutas, NO producción.

## Reglas duras
- Sin backend, sin base de datos, sin auth real. Todo es mock en `lib/mock/`.
- El estado vive en memoria (React state / context). Nada de localStorage salvo que se pida.
- No inventes funcionalidades fuera del alcance de la fase actual.
- Nunca escribas recomendaciones clínicas automáticas. La app MUESTRA, el profesional DECIDE.
- Todos los datos de pacientes son ficticios. Añade marca "Demo · datos ficticios" visible.

## Motor de cálculo (CRÍTICO)
- Las fórmulas de los gráficos están especificadas en `docs/formulas-dashboard.md`. Es la FUENTE DE VERDAD.
- Implementación en `lib/calculations/` como funciones PURAS (sin React, sin estado), con tests.
- Los datos mock guardan valores BRUTOS; las fórmulas se aplican en tiempo de render llamando a `lib/calculations/`. El dashboard calcula de verdad, no pinta números fijos.
- No cambies una fórmula sin que yo lo pida. Si algo no cuadra con `docs/formulas-dashboard.md`, para y pregunta.

## Estética (UI clara + paneles de gráfico oscuros "cockpit")
- Base clara: fondo `bg` (#F6F7F9), cards blancas con borde `borderSoft` y sombra sutil.
- Los colores PUROS del Excel (`data.*`: cyan/rojo/verde/naranja saturados) viven SOLO
  dentro de paneles de gráfico oscuros (`chartBg` #181C20). Nunca en superficies o texto
  general — sin contraste suficiente sobre fondo claro, fatigan la vista.
- Color de marca: cyan `brand` #1DC4EB para acentos grandes / estado activo / panel oscuro.
  Para TEXTO y enlaces cyan sobre fondo claro usa `brandInk` (#0B96B8), que sí contrasta.
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
