# Fisiofles — Especificación de gráficos y fórmulas del dashboard

> Lógica de cálculo extraída directamente del Excel de origen (`BLOCK OUTLINE`, `VALORES GRAFICA RADIAL`, `WEEK n`, `BATERIA TESTS`).
> Verificada contra las capturas reales. Sirve como anexo a la **FASE 3** del brief de Claude Code: implementar estos gráficos con estas fórmulas exactas, no aproximaciones.
>
> **Por qué importa:** replicar las fórmulas reales es lo que hace que el dashboard se sienta clínicamente creíble ante un readaptador. Los números tienen que salir de la misma lógica que ya usa en su Excel.

---

## Resumen de los 4 gráficos

| Gráfico | Qué muestra | Cálculo base |
|---|---|---|
| Perfil físico (radar) | 12 capacidades vs. población de referencia | **Z-score** por sexo: `(valor − media) / desviación` |
| Carga externa vs interna | Carga programada vs carga percibida por semana | Externa = volumen×intensidad · Interna = RPE×duración |
| ACWR (agudo:crónico) | Ratio de riesgo de carga por semana | `carga_semana / media_móvil_4_semanas` |
| Simetrías en test | Déficit bilateral por test | `min(izq,der) / max(izq,der) × 100` |

---

## 1 · Perfil físico (radar) — Z-score normalizado

**Qué es:** cada una de las 12 capacidades se convierte a una puntuación estándar (cuántas desviaciones típicas está el atleta por encima/debajo de la media poblacional de su sexo). Por eso el radar tiene escala **−5 a 3**: son unidades de desviación, no valores brutos.

**Fórmula exacta (de `BLOCK OUTLINE` G26:H38):**

```
z = (valor_atleta − MEDIA_ref) / DESVIACION_ref
```

Donde `MEDIA_ref` y `DESVIACION_ref` dependen del **sexo** del atleta (columnas distintas para Hombre/Mujer).

**Tres series del radar:**
- `INICIAL` → z-score del valor en la primera medición (columna D del Excel)
- `ACTUAL` → z-score del valor actual (columna E)
- `BASE` → siempre `0` (la media poblacional = línea de referencia central, el "0" de la escala z)

**Tabla de referencia (media y desviación típica por capacidad y sexo)** — de `VALORES GRAFICA RADIAL`:

| # | Capacidad | Media ♂ | Desv ♂ | Media ♀ | Desv ♀ |
|---|---|---|---|---|---|
| 1 | Fuerza explosiva | 38.60 | 3.50 | 28.00 | 4.00 |
| 2 | Altura salto CMJ | 40.55 | 4.48 | 31.00 | 4.00 |
| 3 | Fuerza rápida | 201.50 | 11.50 | 159.00 | 10.00 |
| 4 | Fuerza reactiva RSI mod | 0.53 | 0.09 | 0.40 | 0.08 |
| 5 | Fuerza reactiva RSI | 2.25 | 0.50 | 1.85 | 0.30 |
| 6 | Capacidad elástica | 1.09 | 0.16 | 1.10 | 0.21 |
| 7 | Fuerza máxima | 1.83 | 0.21 | 1.16 | 0.18 |
| 8 | Velocidad máxima | 7.12 | 0.28 | 5.76 | 0.20 |
| 9 | Aceleración | 2.99 | 0.03 | 3.40 | 0.14 |
| 10 | Agilidad-COD | 2.413 | 0.128 | 2.67 | 0.217 |
| 11 | Cambio de dirección | 0.481 | 0.107 | 0.531 | 0.142 |
| 12 | Deceleración | 1.95 | 0.12 | 3.34 | 0.32 |
| 13 | RSA | 22.20 | 1.37 | 17.30 | 1.04 |

> Nota: el orden de ejes en el radar del Excel es el de arriba (13 filas), aunque la escala visible muestra 12-13 ejes. Mantén el orden.

**Implementación (TypeScript):**

```typescript
type RefValue = { media_h: number; desv_h: number; media_m: number; desv_m: number };

const referencias: Record<string, RefValue> = {
  "Fuerza explosiva":        { media_h: 38.60, desv_h: 3.50,  media_m: 28.00, desv_m: 4.00 },
  "Altura salto CMJ":        { media_h: 40.55, desv_h: 4.48,  media_m: 31.00, desv_m: 4.00 },
  "Fuerza rápida":           { media_h: 201.5, desv_h: 11.5,  media_m: 159.0, desv_m: 10.0 },
  "Fuerza reactiva RSI mod": { media_h: 0.53,  desv_h: 0.09,  media_m: 0.40,  desv_m: 0.08 },
  "Fuerza reactiva RSI":     { media_h: 2.25,  desv_h: 0.50,  media_m: 1.85,  desv_m: 0.30 },
  "Capacidad elástica":      { media_h: 1.09,  desv_h: 0.16,  media_m: 1.10,  desv_m: 0.21 },
  "Fuerza máxima":           { media_h: 1.83,  desv_h: 0.21,  media_m: 1.16,  desv_m: 0.18 },
  "Velocidad máxima":        { media_h: 7.12,  desv_h: 0.28,  media_m: 5.76,  desv_m: 0.20 },
  "Aceleración":             { media_h: 2.99,  desv_h: 0.03,  media_m: 3.40,  desv_m: 0.14 },
  "Agilidad-COD":            { media_h: 2.413, desv_h: 0.128, media_m: 2.67,  desv_m: 0.217 },
  "Cambio de dirección":     { media_h: 0.481, desv_h: 0.107, media_m: 0.531, desv_m: 0.142 },
  "Deceleración":            { media_h: 1.95,  desv_h: 0.12,  media_m: 3.34,  desv_m: 0.32 },
  "RSA":                     { media_h: 22.20, desv_h: 1.37,  media_m: 17.30, desv_m: 1.04 },
};

function zScore(capacidad: string, valor: number, sexo: "Hombre" | "Mujer"): number {
  const r = referencias[capacidad];
  const media = sexo === "Hombre" ? r.media_h : r.media_m;
  const desv  = sexo === "Hombre" ? r.desv_h  : r.desv_m;
  return (valor - media) / desv;
}
```

> **Cuidado con dos capacidades invertidas:** en Aceleración, Agilidad-COD, Cambio de dirección y RSA, un valor MÁS BAJO suele ser MEJOR (menos tiempo/segundos). El Excel no invierte el signo en la fórmula base, así que respeta la fórmula tal cual para fidelidad; si en la demo quieres que "más lejos del centro = mejor" en todos los ejes, es una decisión de visualización a discutir con el fisio. Por defecto: **replica la fórmula sin invertir**.

**Escala del eje radial:** min −5, max 3 (como el Excel). En Recharts `RadarChart` → `PolarRadiusAxis domain={[-5, 3]}`.

**Colores de serie:** Inicial `#1DC4EB`, Actual `#FF0000` (¡ojo! en el Excel la serie "actual" es roja y la "inicial" cyan — al revés de lo intuitivo), Base `#000000` punteado. En el HUD oscuro invierte Base a gris claro `#B7B7B7` punteado para que se vea sobre negro.

---

## 2 · Carga externa vs interna (por semana)

**Qué es:** contrasta lo que el fisio **programó** (carga externa) con lo que el atleta **percibió** (carga interna), semana a semana.

**Carga externa programada** (de `BLOCK OUTLINE` X):

```
carga_externa = volumen_semanal × intensidad_media
```

**Carga interna aguda** (de `BLOCK OUTLINE` Y, alimentada por cada hoja `WEEK n`):

```
carga_interna_semana = Σ (carga_interna_de_cada_sesión)

carga_interna_sesión = esfuerzo_percibido_sesión (RPE 0-10) × duración_sesión_minutos
```

Es el método **sRPE (session-RPE)** clásico: RPE × minutos. La carga interna semanal es la suma de todas las sesiones de esa semana.

**Estructura temporal:** eje X = semanas post-operación (WEEK 0, WEEK 13, WEEK 14...). Cada semana suma 7 días a la anterior (`fecha[n] = fecha[n-1] + 7`).

**Implementación:**

```typescript
function cargaInterna(sesiones: { rpe: number; duracionMin: number }[]): number {
  return sesiones.reduce((acc, s) => acc + s.rpe * s.duracionMin, 0);
}

function cargaExterna(volumenSemanal: number, intensidadMedia: number): number {
  return volumenSemanal * intensidadMedia;
}
```

**Visualización:** dos series (externa programada en cyan, interna aguda en un tono diferenciado) sobre el mismo eje temporal. Barras o líneas.

---

## 3 · ACWR — Acute:Chronic Workload Ratio ⭐

**Qué es:** el gráfico estrella de prevención de lesiones. Divide la carga de la semana actual (aguda) entre la media de las semanas recientes (crónica). Ratios fuera de la zona óptima señalan riesgo.

**Fórmula exacta (de `BLOCK OUTLINE` AS/AT):**

```
carga_crónica[n] = AVERAGE(carga_aguda[n-4], carga_aguda[n-3], carga_aguda[n-2], carga_aguda[n-1])
                   → media móvil de las 4 semanas ANTERIORES

ACWR[n] = carga_aguda[n] / carga_crónica[n]
```

Es el modelo **rolling average de 4 semanas** (el estándar de Gabbett). La carga aguda es la `carga_interna_semana` del gráfico 2 (sRPE).

**Bandas de referencia (umbrales del Excel, AU/AV):**

| Banda | Valor | Significado | Color |
|---|---|---|---|
| Insuficiente | < 0.8 | subcarga, desentrenamiento | rojo `#FF0000` |
| **Zona óptima** | 0.8 – 1.3 | carga adecuada | verde `#00FF44` |
| Riesgo moderado | > 1.3 | sobrecarga, riesgo de lesión | naranja `#FF9900` |

> Las capturas muestran las bandas como líneas horizontales punteadas en 0.8 (insuficiente), 1.3 (zona óptima) y ~1.5 (riesgo moderado). Usa `0.8` y `1.3` como umbrales duros; la banda naranja arranca en 1.3.

**Implementación:**

```typescript
function cargaCronica(cargasAgudas: number[], semanaIdx: number): number | null {
  if (semanaIdx < 4) return null; // no hay 4 semanas previas
  const previas = cargasAgudas.slice(semanaIdx - 4, semanaIdx);
  return previas.reduce((a, b) => a + b, 0) / 4;
}

function acwr(cargaAguda: number, cargaCronica: number | null): number | null {
  if (!cargaCronica || cargaCronica === 0) return null;
  return cargaAguda / cargaCronica;
}

function zonaAcwr(ratio: number): "insuficiente" | "optima" | "riesgo" {
  if (ratio < 0.8) return "insuficiente";
  if (ratio <= 1.3) return "optima";
  return "riesgo";
}
```

**Visualización (Recharts):** `LineChart` con la línea del ratio en cyan + 2 `ReferenceLine` horizontales (0.8 y 1.3) punteadas, o `ReferenceArea` para pintar las tres bandas de fondo (rojo bajo 0.8, verde 0.8-1.3, naranja sobre 1.3). Las primeras 4 semanas no tienen ratio (carga crónica aún no calculable) — muéstralas vacías o con aviso.

---

## 4 · Simetrías en test — Índice de simetría bilateral

**Qué es:** compara el rendimiento de la pierna lesionada vs. la sana en cada test. El % de simetría es el criterio clave de retorno al deporte (habitualmente se busca ≥90%).

**Fórmula (verificada contra capturas):**

```
simetría_% = min(izquierda, derecha) / max(izquierda, derecha) × 100
```

Verificado: leg curl 30/35 = **85.71%**, leg extension 50/60 = **83.33%** — coinciden exactamente con las capturas.

**Tests del catálogo** (de `BATERIA TESTS`, columnas jump test y strength test):
- **Strength:** 5RM Leg Extension, 5RM Leg Curl, 3RM Box Squat, 5RM Box Squat, 3RM Deadlift, 5RM Deadlift
- **Jump:** CMJ, SJ, Drop Jump, SL CMJ, SL DJ, Triple Hop, Hop Battery, LESS Scale

**Implementación:**

```typescript
function simetria(izq: number, der: number): number {
  if (Math.max(izq, der) === 0) return 0;
  return (Math.min(izq, der) / Math.max(izq, der)) * 100;
}

function estadoSimetria(pct: number): "deficit" | "aceptable" | "optimo" {
  if (pct < 85) return "deficit";      // rojo
  if (pct < 90) return "aceptable";    // naranja
  return "optimo";                     // verde/cyan
}
```

> **Excepción:** "Hop Battery" y "SL DJ" en las capturas (65.56%, 20%) no salen de un simple min/max de dos valores — son baterías compuestas de varios sub-tests o usan una base normativa distinta. Para la demo, trátalos como un valor de simetría ya calculado que viene en los datos mock (no recalcules), o simplifícalos a min/max de dos piernas con valores que den esos %. Documenta el supuesto.

**Visualización:** replica exactamente las capturas → dos barras enfrentadas por test (lado con déficit apagado/rojo, lado fuerte en cyan), el valor numérico dentro de cada barra, y el **% grande debajo** en Space Grotesk. Añade una línea de objetivo en 90%.

---

## Anexo · Cómo generar los datos mock coherentes

Para que los 3 atletas del brief cuenten su historia con estas fórmulas:

1. **Marcos Vidal (LCA, fase 3):** mete valores brutos que al pasar por el z-score den un radar "actual" por encima del "inicial" pero aún bajo en fuerza reactiva. En simetrías, leg curl/extension ~85%, hop battery 66% (déficit narrativo). ACWR con un pico reciente >1.3.
2. **Laura Sáez (aquíleas, fase 2):** simetrías 90%+, ACWR conservador siempre en 0.8-1.3.
3. **Diego Torres (tobillo, fase 4):** casi de alta, simetrías 92-98%, z-scores actuales cerca o sobre 0, ACWR óptimo estable.

Genera los valores **brutos** (no los z-scores) y deja que el componente aplique la fórmula — así el dashboard "calcula de verdad" y se puede enseñar el mecanismo al fisio.

---

## Checklist de fidelidad para Claude Code

- [ ] Radar usa z-score `(valor−media)/desv` con tabla de referencia por sexo, escala −5 a 3
- [ ] Serie BASE del radar = 0 constante (línea central)
- [ ] Carga interna = RPE × duración (sRPE), sumada por semana
- [ ] ACWR = carga_aguda / media_móvil_4_semanas_previas
- [ ] Bandas ACWR: <0.8 insuficiente, 0.8-1.3 óptima, >1.3 riesgo
- [ ] Primeras 4 semanas sin ACWR (sin datos crónicos)
- [ ] Simetría = min/max × 100, objetivo 90%
- [ ] Los valores mock son brutos; las fórmulas se aplican en el componente
