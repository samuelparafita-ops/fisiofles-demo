# CLAUDE.md — Fisiofles Demo

## Qué es esto
Demo clicable de Fisiofles: plataforma de seguimiento y análisis para readaptación
deportiva. Es un PROTOTIPO para enseñar a fisioterapeutas, NO producción.

## Reglas duras
- Sin backend, sin base de datos, sin auth real. Todo es mock en `lib/mock/`.
- El store se persiste en `localStorage` bajo la clave única `fisiofles-demo-v4`
  (ver `lib/store/`). Hay una acción "Restablecer demo" (menú del avatar y
  Personalización) que re-siembra desde `lib/mock/seed.ts` y borra TODA clave
  `fisiofles-demo*`, no solo la actual — un navegador que abrió una versión
  anterior arrastra `fisiofles-demo-v2`/`-v3` muertas.
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

## Lesiones, fases, criterios y semáforo (v4)
- `TipoLesion`/`FaseLesion` (`lib/store/types.ts`) son entidades del profesional,
  no texto libre: `TipoLesion.fases` es un array ORDENADO (el orden = el orden
  del proceso = el orden del semáforo) y cada fase lleva `criterios?: string[]`
  (checklist clínico INFORMATIVO para entrar en ella — la app los muestra, no
  los evalúa ni los usa en ningún cálculo). `AppState.tiposLesion` hereda
  CREAR/ACTUALIZAR/ELIMINAR gratis vía `EntityMap` (reducer genérico). El tipo
  especial `esRendimiento: true` ("Rendimiento", una única fase) no es eliminable
  en UI — para atletas sin lesión activa. Borrar un tipo o una fase con atletas
  asignados OBLIGA a reasignar (`components/personalizacion/eliminar-lesion-dialog.tsx`,
  un único componente para ambos casos vía discriminated union): nunca quedan
  `lesionId`/`faseId` huérfanos.
- `Atleta.lesionId`/`faseId` son la ÚNICA fuente de verdad de la fase. Los
  escriben la semilla y `components/atletas/nuevo-atleta-dialog.tsx` (select de
  tipo + select de fase dependiente, con la tira de semáforo bajo el segundo).
  Siguen siendo `?` opcionales sólo por defensa ante un estado hidratado de una
  versión anterior. Resuélvelos contra el catálogo con `useFaseDeAtleta(atleta)`
  o la versión pura `resolverFaseDeAtleta(atleta, tiposLesion)`
  (`lib/store/hooks.ts`) para listas — no se puede llamar un hook dentro de un
  `.map()`. Ambas devuelven `{ tipoLesion, fase, indiceFase, totalFases } | null`;
  si es `null`, las vistas pintan un badge neutro "Sin fase asignada".
- **Tres campos distintos de lesión, ninguno derivable de otro** — no los
  confundas ni los "unifiques":
  `Atleta.lesion` (texto, "Fractura por estrés 2º metatarsiano") = descripción
  del CASO concreto · `lesionId` → `TipoLesion.nombre` ("Esguince de tobillo") =
  proceso del CATÁLOGO, que es cerrado y editable por el fisio · `lesionDetalle`
  (texto largo) = matiz clínico. El catálogo de 6 tipos sembrados NO cubre las
  10 lesiones reales de la semilla (varias son analogías de región/proceso), de
  ahí que `lesion` siga existiendo y lo pinten card, tabla e informe.
- Semáforo de proceso: `lib/calculations/semaforo.ts` `colorSemaforo(indice,
  total)`/`colorSemaforoTexto(indice, total)`. Interpola en espacio **HSL** (no
  RGB: por RGB el tramo medio se ensucia en marrones) entre
  `colors.semaforo.inicio` (#980000, rojo) y `colors.semaforo.fin` (#8BF200,
  verde fosforito), pasando por naranja → amarillo → lima. `total=1` pinta
  siempre verde fosforito (proceso de una fase = rendimiento). El color NUNCA se
  guarda: se deriva de `(indice, total)` en cada render, así que añadir/quitar/
  reordenar una fase recolorea todos los chips del tipo al instante. Los dos hex
  extremos viven SOLO en `lib/tokens.ts` y nadie más los importa directamente:
  todo pasa por esas dos funciones.

## Ejercicios: etiquetas EMERGENTES
- `Ejercicio.etiquetas: string[]` (`lib/mock/ejercicios.ts`) es la taxonomía
  libre del fisio (patrón + zona corporal + lesiones típicas: "Tren superior",
  "CORE", "Isométricos", "LCA", "Tendinopatía rotuliana"...) — un mismo
  ejercicio puede llevar etiquetas de zonas y lesiones que no coinciden con su
  `categoria` legado (ej. `press-banca` es "Tren superior" pero lleva la
  etiqueta "LCA" porque se prescribe dentro de un proceso de LCA para mantener
  fuerza general). `categoria` no se elimina (vistas actuales lo usan).
  `Ejercicio.enlaceVideo?` es un link de vídeo opcional.
- **No hay catálogo cerrado de etiquetas y no debe haberlo.** Son emergentes:
  se crean escribiéndolas en `components/ejercicios/etiquetas-input.tsx`
  (`EtiquetasInput`, chip input propio: Enter añade, × quita, Backspace en
  vacío borra el último) y las SUGERENCIAS se derivan en render de las
  etiquetas ya usadas en `useEjercicios()`. El filtro "Etiquetas" de
  `/ejercicios` deriva sus opciones igual (si nadie usa "CORE", la opción no
  existe) y reutiliza el `SelectorFiltro` genérico de
  `components/dashboard/selector-filtro.tsx`, con semántica OR. Hay un hint
  suave de 4-5 etiquetas, SIN tope duro. Personalización no gestiona etiquetas
  (solo lo explica con una nota) — si alguien pide "administrar etiquetas",
  eso rompe el modelo.

## Sesiones: sub-bloques, tipo/RPE e intensidad (v4)
- `Sesion.bloquesEjercicios?: BloqueEjercicios[]` organiza los ejercicios en
  sub-bloques ORDENADOS (Preparación → Activación → Bloque principal 1..n, del
  Excel REHAB CREATION). **Lee SIEMPRE con `bloquesDeSesion(sesion)` y cuenta
  con `totalEjerciciosSesion(sesion)`** (`lib/store/sesiones.ts`), nunca
  `sesion.ejercicios` directamente: el helper devuelve `bloquesEjercicios` si
  existe y tiene contenido, y si no envuelve `ejercicios` en un único bloque
  "Principal". Todo lo que ESCRIBE una sesión (los dos diálogos de sesión y
  `lib/store/aplicar-plantilla.ts`) rellena los DOS campos: `bloquesEjercicios`
  con el desglose real y `ejercicios` con el aplanado.
- `Sesion.ejercicios` (plano) es LEGADO CONSCIENTE, no olvido: sigue en el tipo
  porque (a) es la entrada del helper de compatibilidad para sesiones ya
  persistidas en `localStorage`, y (b) `PlantillaSesion.ejercicios` y
  `PlantillaPrograma.semanas[].sesiones` son planos POR DISEÑO — `/plantillas`
  no tiene sub-bloques y sigue usando `ejercicios-sesion-editor.tsx`, mientras
  que la ficha usa `bloques-ejercicios-editor.tsx`. Retirarlo del todo obliga a
  rediseñar plantillas; queda para v5.
- `Sesion.tipo?`/`rpeObjetivo?` son texto corto ("Gym", "Campo",
  "Readaptación") y RPE objetivo (0-10, admite medios). **Regla dura: la
  intensidad de una sesión SIEMPRE se calcula, NUNCA se guarda** (misma regla
  que el LSI) — no existe ni debe existir un campo `intensidad` en `Sesion`.
  Se deriva con `intensidadSesion(rpe, { rpeLow, rpeHigh })`
  (`lib/calculations/intensidad.ts`: low si `rpe <= rpeLow`, high si
  `rpe > rpeHigh`, moderate en medio), con los umbrales SIEMPRE de
  `config.umbrales.rpeLow`/`rpeHigh` (defecto 6/8), nunca hardcodeados. El
  único componente que la pinta es `components/programacion/intensidad-chip.tsx`
  (`ChipIntensidad`, labels "Low"/"Moderate"/"High" en inglés a petición del
  cliente — terminología de su Excel). Consecuencia visible: cambiar `rpeHigh`
  en Personalización recolorea al instante todos los chips de la parrilla.
- `BloqueSemanal.semanaPostOpInicio?`/`semanasTest?` (del BLOCK OUTLINE del
  Excel) documentan en qué semana post-operatoria arranca el bloque y qué
  semanas (índices 0-based) son "semana de test".

## Ficha de atleta (v4, FASE 4)
- `FichaHeader` (`components/atletas/ficha/ficha-header.tsx`) reemplaza y
  fusiona el antiguo `DatosGeneralesFicha` (retirado): identidad + badge de
  fase (semáforo)/entrenador a la izquierda, fila de métricas SELECCIONABLES
  al centro, `RadarPerfil` en modo `compact` a la derecha. Todo en una sola
  fila sin card propia (salvo el radar, que ya es un `ChartPanel`) para que
  cueste poca altura — la exigencia del cliente es que los tabs se vean SIN
  scroll en ~1366×768. El resto de datos del atleta (contacto, fechas,
  detalle de la lesión) vive en el popover "Ver datos completos" del header,
  editable con `CampoEditable` igual que antes.
- Métricas del header: `config.fichaMetricas` (3-5 ids de `MetricaFicha`,
  `lib/store/types.ts`), seleccionables desde un popover del propio header
  que dispatcha `CONFIG_ACTUALIZAR` — es GLOBAL (afecta a todos los atletas),
  no por atleta. Los valores se leen de los hooks/cálculos ya existentes
  (`useResumenAtleta`, `useReadinessActual`, `atleta.acwr`/`semanaProceso`) o
  de helpers locales sin motor propio (adherencia 28 días, próxima sesión
  programada) — no dupliques el cálculo en otro sitio.
- Tabs de la ficha, en este orden fijo: Calendario (por defecto sin `?tab=`
  en la URL) → Anamnesis → Datos → Programación → Historial (`value="general"`
  por los deep-links de notificaciones, no renombrar) → Formularios → Notas
  clínicas. `TabAnamnesis` (`tab-anamnesis.tsx`) y las notas clínicas
  (`notas-clinicas.tsx`, ahora tab propio en vez de vivir dentro de
  Historial/`TabHistorial`) son nuevos/movidos en FASE 4.
- `CajaHallazgos` de la ficha baja al FINAL de la página (después de los tabs),
  colapsada por defecto vía su prop `colapsableInicial` (ya existía, no hizo
  falta tocar el componente).

## Programación: UN módulo, DOS entradas (v4, FASE 5)
- Principio INNEGOCIABLE: el módulo de programación se construye una vez y se
  monta en dos sitios. Si te encuentras copiando JSX entre `/programacion` y el
  tab Programación de la ficha, para y extrae componente.
  - `components/programacion/programacion-view.tsx` (`ProgramacionView`) pinta
    UN `BloqueSemanal` (cabecera colapsable + `WeekStrip` + `SesionDetalleCard`
    por sesión). Es la pieza compartida.
  - `components/atletas/ficha/tab-programacion.tsx` (`TabProgramacion`) la monta
    por cada bloque del atleta; `components/programacion/modo-atleta.tsx`
    monta LITERALMENTE `TabProgramacion` — no hay una segunda implementación.
  - `components/programacion/parrilla-semanal.tsx` es lo único propio de
    `/programacion` (filas = atletas activos filtrados, columnas = L-D), y aun
    así reutiliza `NuevaSesionDialog`/`SesionDetalleDialog` de la ficha. Cada
    celda-sesión lleva el acento izquierdo con el `colorSemaforo` de la fase del
    atleta + `ChipIntensidad`. `NuevaSesionDialog` acepta `trigger?: ReactNode`
    justo para colgarse del "+" que aparece al hover de una celda vacía.
- **Pertenencia sesión↔bloque: por `sesionIds` O por FECHA.**
  `useProgramacionDeAtleta` (`lib/store/hooks.ts`) resuelve las sesiones de cada
  bloque como `sesionIds` ∪ (sesiones del atleta dentro de
  `fechaInicio`–`fechaFin`), y agrupa las que no caen en ningún bloque en uno
  sintético "Sesiones fuera de bloque" al final. Es imprescindible: los diálogos
  de creación escriben en `sesiones`, nunca en `bloque.sesionIds`, así que sin
  la vía de la fecha una sesión creada desde la parrilla salía allí y en el
  Calendario pero jamás en el tab Programación (bug real de FASE 5, corregido
  en FASE 8). No "arregles" esto haciendo que los diálogos empujen ids a
  `sesionIds`: duplicaría la fuente de verdad.

## Notas de calendario (clínica)
- `NotaCalendario` (`AppState.notasCalendario`, hook `useNotasCalendario()`):
  nota libre de fecha con `atletaId?` opcional para ligarla a un atleta (ej.
  "Marcos de vacaciones"). Entidad CRUD genérica vía `EntityMap`. Una ausencia
  de varios días son N notas sueltas, NO un rango: no inventes rangos.
  Se editan desde el popover de cada día de `calendario-renovaciones.tsx`.

## Informe imprimible (v4, FASE 7)
- Vive en `app/(informe)/clinica/informe/` — **grupo de rutas propio, sin
  sidebar ni topbar**. Por eso `@media print` en `app/globals.css` solo fija el
  tamaño de página (A4): no hay chrome de app que ocultar. Lo demás son
  utilidades Tailwind en `components/informe/paso-preview.tsx`: `print:hidden`
  en la barra de acciones y `break-inside-avoid` en cada gráfica.
- Wizard de 2 pasos (`informe-wizard.tsx`): Configurar (atleta + gráficas del
  catálogo EXISTENTE `catalogoGraficos()` reordenables con `ListaReordenable` —
  checkboxes + flechas, nunca drag&drop — + comentario + rango) → Vista previa.
  Cero gráficas nuevas: el informe CONSUME el motor, no lo amplía. El único
  texto interpretativo del documento es el comentario que escribe el profesional.
- El documento tiene ancho FIJO `ANCHO_INFORME_PX = 794` (A4 a 96dpi), igual en
  pantalla que en impresión, para que los `ResponsiveContainer` de Recharts
  midan siempre lo mismo (si el contenedor cambia de tamaño al imprimir, las
  gráficas salen deformadas).
- **El documento es SIEMPRE claro**, aunque el usuario tenga el tema "oscuro":
  acaba en papel. Se consigue con DOS piezas que van siempre juntas — la clase
  `.tema-claro` de `app/globals.css` (deshace `.dark` para las CSS vars de su
  subárbol) y `<TemaForzado tema="fisiofles">` de `lib/theme.ts` (context que
  `useChartColors`/`useChartGridColors`/`useStateColors`/`useCockpit` consultan
  antes que `config.tema`, porque esos colores son inline en el SVG de Recharts
  y no pasan por CSS vars). Sin las dos, el informe salía con fondo blanco,
  texto casi blanco y paneles de gráfico negros.

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
  resaltan los atletas de "Comparar atletas" — SIN tope (FASE 3): los 6 primeros
  usan los colores estables de `colors.comparison`, del 7º en adelante
  `useComparisonColorsExtended(n)` (`lib/theme.ts`) genera tonos deterministas
  por rotación de tono HSL con el mismo contraste AA sobre blanco. En el tab
  Datos de la ficha reciben `activos + el propio atleta` con
  `atletasSeleccionados = [atleta.id]` — el atleta protagoniza el color,
  el resto del equipo cae en el agregado gris (al revés que en `/dashboard`).
- El filtro "Lesión" de `/dashboard` solo lista `tiposLesion` con algún atleta
  activo asignado (derivado de `atletas` en cada render, no cacheado). El
  filtro "Fase" solo se activa con EXACTAMENTE una lesión seleccionada — sus
  opciones son las fases de esa lesión, en orden, coloreadas con
  `colorSemaforo`; con 0 o ≥2 lesiones se deshabilita y limpia la selección de
  fases. `SelectorFiltro` (`components/dashboard/selector-filtro.tsx`) acepta
  opciones con color/estado deshabilitado+hint para soportar esto.
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
  `Atleta.anamnesis` tiene su propio tab en la ficha (`TabAnamnesis`, FASE 4):
  la PREGUNTA de cada par es fija (como un label de `CampoEditable`), solo la
  RESPUESTA se edita inline; añadir/eliminar pares es la única forma de tocar
  las preguntas en sí.

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
  a comprobar en ~460-540px de ancho de card, no solo en escritorio. Su prop
  `compact` (header de la ficha, FASE 4) reduce padding/alto y oculta
  descripción/leyenda/toggle "Comparar con inicial", pero el contenedor NUNCA
  puede ir por debajo de ~320px de ancho con las 12 capacidades visibles: por
  debajo de eso Recharts recorta/superpone las etiquetas de los ejes
  horizontales (izquierda/derecha) contra el borde del SVG — comprobado a
  ojo con capturas, no hay test automático para esto.

## Qué legado se retiró en v4 (y qué NO)
Retirado del todo en FASE 8 — si lo ves en un ejemplo viejo, ya no existe:
- `Atleta.fase` (texto libre tipo "Fase 3 · Readaptación al campo") y
  `components/atletas/fase-utils.ts` (`FASE_OPCIONES`/`fasePrefijo`/
  `ordenarFases`). La fase es SIEMPRE `faseId` resuelto contra el catálogo.
- El filtro "Fase" de `/atletas`, sustituido por un filtro "Lesión" derivado en
  render (solo tipos con algún atleta), igual que en `/dashboard` y
  `/programacion`. Desde v4 una fase pertenece a UNA lesión, así que un filtro
  global "Fase 3" no significaba nada.
- `useComparisonColors()` (FASE 3), sustituido por `useComparisonColorsExtended(n)`.
- `DatosGeneralesFicha` y `config.metricasVisiblesDashboard`/`ordenDashboard`.

Legado que se QUEDA a propósito (no lo "limpies" sin leer el porqué):
- `Atleta.lesion` — descripción del caso, distinta del tipo del catálogo y del
  `lesionDetalle`; ver "Lesiones, fases, criterios y semáforo".
- `Sesion.ejercicios` — entrada del helper de compatibilidad y formato de las
  plantillas; ver "Sesiones: sub-bloques".
- `Ejercicio.categoria` — el filtro protagonista son las etiquetas, pero la
  categoría sigue pintándose en las cards y en `/plantillas`.

## Stack
Next.js 14 (App Router) · TypeScript · Tailwind · shadcn/ui · Recharts · lucide-react

## Deploy
Vercel. `vercel deploy`. La demo debe funcionar sin variables de entorno.
