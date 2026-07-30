# CLAUDE.md — Fisiofles Demo

## Qué es esto
Demo clicable de Fisiofles: plataforma de seguimiento y análisis para readaptación
deportiva. Es un PROTOTIPO para enseñar a fisioterapeutas, NO producción.

## Reglas duras
- Sin backend, sin base de datos, sin auth real. Todo es mock en `lib/mock/`.
- El store se persiste en `localStorage` bajo la clave única `fisiofles-demo-v4`
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
- Las fórmulas de los gráficos están especificadas en `docs/Fisiofles_Formulas_Dashboard.md`. Es la FUENTE DE VERDAD.
- Implementación en `lib/calculations/` como funciones PURAS (sin React, sin estado), con tests.
- Los datos mock guardan valores BRUTOS; las fórmulas se aplican en tiempo de render llamando a `lib/calculations/`. El dashboard calcula de verdad, no pinta números fijos.
- No cambies una fórmula sin que yo lo pida. Si algo no cuadra con `docs/formulas-dashboard.md`, para y pregunta.

## Lesiones, fases y semáforo (v4)
- `TipoLesion`/`FaseLesion` (`lib/store/types.ts`) son entidades del profesional,
  no texto libre: `TipoLesion.fases` es un array ORDENADO (el orden = el orden
  del proceso = el orden del semáforo). `AppState.tiposLesion` hereda
  CREAR/ACTUALIZAR/ELIMINAR gratis vía `EntityMap` (reducer genérico). El tipo
  especial `esRendimiento: true` ("Rendimiento", una única fase) no es eliminable
  en UI — para atletas sin lesión activa.
- `Atleta.lesionId`/`faseId` son la fuente de verdad v4, pero **opcionales**:
  `components/atletas/nuevo-atleta-dialog.tsx` todavía crea atletas solo con
  `lesion`/`fase` (texto) y no se ha migrado en esta fase. `Atleta.lesion`/`fase`
  (texto) siguen siendo lo que leen TODAS las vistas actuales — legado en
  retirada, se migran en FASE 3/4. Resuelve `lesionId`/`faseId` contra el
  catálogo con el hook `useFaseDeAtleta(atleta)` (`{ tipoLesion, fase,
  indiceFase, totalFases } | null`).
- Semáforo de proceso: `lib/calculations/semaforo.ts` `colorSemaforo(indice,
  total)`/`colorSemaforoTexto(indice, total)` interpola en HSL entre
  `colors.semaforo.inicio` (rojo) y `colors.semaforo.fin` (verde fosforito) —
  ambos hex viven SOLO en `lib/tokens.ts`, nadie más los importa directamente.
  `total=1` pinta siempre verde fosforito (proceso de una fase = rendimiento).

## Ejercicios: etiquetas
- `Ejercicio.etiquetas: string[]` (`lib/mock/ejercicios.ts`) es la taxonomía
  libre del fisio (patrón + zona corporal + lesiones típicas: "Tren superior",
  "CORE", "Isométricos", "LCA", "Tendinopatía rotuliana"...) — un mismo
  ejercicio puede llevar etiquetas de zonas y lesiones que no coinciden con su
  `categoria` legado (ej. `press-banca` es "Tren superior" pero lleva la
  etiqueta "LCA" porque se prescribe dentro de un proceso de LCA para mantener
  fuerza general). `categoria` no se elimina (vistas actuales lo usan).
  `Ejercicio.enlaceVideo?` es un link de vídeo opcional.

## Sesiones: sub-bloques, tipo/RPE e intensidad (v4)
- `Sesion.bloquesEjercicios?: BloqueEjercicios[]` organiza los ejercicios en
  sub-bloques ORDENADOS (Preparación → Activación → Bloque principal 1..n, del
  Excel REHAB CREATION). Es opcional y coexiste con el `Sesion.ejercicios`
  plano legado: ninguno de los dos se ha retirado porque `nueva-sesion-dialog.tsx`
  y `lib/store/aplicar-plantilla.ts` siguen creando sesiones solo con
  `ejercicios`. Usa `bloquesDeSesion(sesion)` (`lib/store/sesiones.ts`) para leer
  el desglose correcto sin distinguir el caso legado: devuelve
  `bloquesEjercicios` si existe y tiene contenido, si no envuelve `ejercicios`
  en un único bloque "Principal". Las vistas actuales no llaman a este helper
  todavía (se migran en FASE 5).
- `Sesion.tipo?`/`rpeObjetivo?` son texto corto ("Gym", "Campo",
  "Readaptación") y RPE objetivo (0-10, admite medios). **Regla dura: la
  intensidad de una sesión SIEMPRE se calcula, NUNCA se guarda** (misma regla
  que el LSI) — `intensidadSesion(rpe, { rpeLow, rpeHigh })` en
  `lib/calculations/intensidad.ts`, con los umbrales siempre de
  `config.umbrales.rpeLow`/`rpeHigh` (defecto 6/8), nunca hardcodeados.
- `BloqueSemanal.semanaPostOpInicio?`/`semanasTest?` (del BLOCK OUTLINE del
  Excel) documentan en qué semana post-operatoria arranca el bloque y qué
  semanas (índices 0-based) son "semana de test".

## Notas de calendario (clínica)
- `NotaCalendario` (`AppState.notasCalendario`, hook `useNotasCalendario()`):
  nota libre de fecha con `atletaId?` opcional para ligarla a un atleta (ej.
  "Marcos de vacaciones"). Entidad CRUD genérica vía `EntityMap`.

## Motor de gráficos por test (dashboard + ficha)
- `lib/dashboard/graficos.ts` → `catalogoGraficos()`/`GraficoDef`: catálogo único de
  gráficos (`origen: "test"` o `resultado: acwr|simetria|carga|dolor|sesiones|
  readiness|cuadrante-fv`). Lo comparten `/dashboard` y el tab Datos de la ficha —
  no hay un catálogo separado por vista.
- `lib/dashboard/series-tests.ts` → `serieTest`/`ultimoValorPorAtleta`/
  `puntosCuadranteFV`/`rangoDesdeSemanas`: construye las series a partir de
  `registrosTests`. La variable base (no-LSI) de un test `unilateral-lsi` es
  `max(izq, der)` (lado fuerte) — no hay "valor único" natural para un bilateral
  fuera del propio LSI.
- Componentes: `GraficoTest`/`GraficoResultado` renderizan cualquier entrada del
  catálogo; `BarrasComparativa`/`BarrasTemporal`/`DispersionCuadrante` son los de
  bajo nivel. `components/dashboard/selector-graficos.tsx` es genérico (recibe
  `catalogo`/`seleccionados`/`onChange`), lo usan ambas vistas.
- En `/dashboard`, `GraficoTest`/`GraficoResultado` reciben la plantilla activa y
  resaltan los atletas de "Comparar atletas" (hasta 6, colores estables vía
  `colors.comparison`). En el tab Datos de la ficha reciben `activos + el propio
  atleta` con `atletasSeleccionados = [atleta.id]` — el atleta protagoniza el color,
  el resto del equipo cae en el agregado gris (al revés que en `/dashboard`).
- `BarrasComparativa` (barras "Por atleta") siempre angula las etiquetas del eje X
  (-30°) y las trunca al primer nombre vía `tickFormatter` — con hasta 6-7 atletas
  el nombre completo no cabe aunque solo haya 6 barras; el tooltip sigue mostrando
  el nombre completo. No lo condiciones a un nº de atletas: aplícalo siempre.
- La selección de "Comparar atletas" (dashboard) y de "ejes visibles" del radar
  (ficha) son estado LOCAL de componente a propósito — preferencia de vista
  puntual, no umbral clínico ni dato del atleta; se resetea al salir/recargar.
  Lo que SÍ persiste en `config` es la selección del selector "Gráficos" (qué
  paneles se muestran), vía `config.dashboardGraficos`/`config.fichaGraficos`.

## Estética (UI clara — sin "cockpit" por defecto)
- Base clara: fondo `bg` (#F6F7F9), cards blancas con borde `borderSoft` y sombra sutil.
  Todos los gráficos (`components/charts/`) usan `ChartPanel`: UN único contenedor claro,
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

## Clínica y entrenadores
- Entidad `Entrenador` (`lib/store`): `id`, `nombre`, `rol`, `capacidadMaxima`.
  `Atleta.entrenadorId` es opcional y referencia un `Entrenador`; se edita desde
  `AsignarEntrenadorDialog` (menú "···" de cualquier card/fila/ficha), que
  dispatcha `accionActualizar("atletas", id, { entrenadorId })` — la única fuente
  de verdad es ese campo, no hay lista inversa que mantener a mano.
- `/clinica` (`components/clinica/`): métricas de negocio (atletas en plantilla,
  suscripciones que caducan, ocupación global), calendario navegable de
  renovaciones y `SaturacionEntrenadores` — todo derivado en tiempo de render
  filtrando `atletas` por `entrenadorId`, nunca cacheado. Reasignar el
  entrenador de un atleta desde `/atletas` se refleja ahí al instante.
  Los atletas en estado "alta" no cuentan como "sin asignar" (ya no ocupan
  plaza), pero SÍ siguen contando en la ocupación del entrenador que tuvieran
  asignado — es el comportamiento existente de FASE 8, no lo cambies sin más.
- `Atleta.suscripcion` (plan, fechas) y `Atleta.anamnesis` (preguntas/respuestas)
  son datos de semilla editables como cualquier otro campo del atleta.

## Convenciones de código
- TypeScript estricto. Componentes funcionales.
- Gráficos con Recharts, siempre dentro de `components/charts/`.
- Componentes shadcn/ui para UI base; personalizados en `components/`.
- Nombres de datos y UI en español (es el idioma del producto).
- Comenta poco pero nombra bien.
- `Badge` (shadcn) es `inline-flex`: `text-overflow: ellipsis` NO se pinta si
  `truncate` se aplica directamente sobre el propio `Badge` (gotcha real de
  flex/inline-flex containers — el texto se corta pero sin "…"). Si un Badge
  necesita truncar, pon `truncate` en un `<span className="block truncate">`
  hijo y `min-w-0` (+ `max-w-[…]` si no está en una fila flex que ya lo acota)
  en el propio Badge.
- `ChartPanel` (`components/charts/chart-panel.tsx`): la fila de cabecera
  `action + metric` lleva `flex-wrap` — no lo quites. Sin eso, la cifra grande
  (`text-4xl`/`md:text-5xl`) se corta o invade la card vecina en el grid de 2
  columnas de tablet, donde una card ronda los 250-260px de ancho real (bastante
  menos que en el grid de 3 de escritorio).
- `RadarPerfil` usa `outerRadius="55%"` (no más) para que las 12 etiquetas de
  capacidad quepan sin cortarse en el layout de una columna de tablet/ficha; en
  escritorio (2 columnas) sigue viéndose bien. Si tocas este componente, vuelve
  a comprobar en ~460-540px de ancho de card, no solo en escritorio.

## Stack
Next.js 14 (App Router) · TypeScript · Tailwind · shadcn/ui · Recharts · lucide-react

## Deploy
Vercel. `vercel deploy`. La demo debe funcionar sin variables de entorno.
