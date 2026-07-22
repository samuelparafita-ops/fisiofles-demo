/**
 * Copia literal de `docs/mediciones-catalogo.csv` (catálogo REAL de tests y
 * variables del sistema del que nace este producto). Next.js no soporta
 * importar .csv como texto plano sin loader custom, y la app necesita
 * sembrar el catálogo de forma síncrona en el primer render (SSR-safe) — de
 * ahí esta copia embebida.
 *
 * NO editar a mano: si `docs/mediciones-catalogo.csv` cambia, regenerar esta
 * constante a partir del fichero fuente (fuente de verdad). El test
 * `catalogo.test.ts` compara esta copia contra el fichero real y falla si se
 * desincronizan.
 */

export const CATALOGO_CSV_RAW = `﻿CATÁLOGO · tests y variables;
Fuente de los desplegables Test y Variable · amplíalo con tu batería;
;
TEST;VARIABLE
CMJ;Altura (cm)
CMJ;Peak power (W/kg)
CMJ;RSI-mod
CMJ;Tiempo de contacto (s)
CMJ;Tiempo de vuelo (s)
CMJ;Impulso (N·s)
SJ;Altura (cm)
SJ;Peak power (W/kg)
Abalakov;Altura (cm)
Drop Jump;Altura (cm)
Drop Jump;RSI
Drop Jump;Tiempo de contacto (s)
SL CMJ;Altura (cm)
SL CMJ;LSI (%)
SL Drop Jump;Altura (cm)
SL Drop Jump;LSI (%)
IMTP;Peak force (N)
IMTP;Fuerza relativa (N/kg)
IMTP;RFD (N/s)
Dinamometría cuádriceps;Fuerza (N)
Dinamometría cuádriceps;LSI (%)
Dinamometría isquios;Fuerza (N)
Dinamometría isquios;LSI (%)
Dinamometría aductores;Fuerza (N)
Dinamometría aductores;LSI (%)
Nordic;Fuerza (N)
Nordic;LSI (%)
1RM estimado;Carga (kg)
1RM estimado;Fuerza relativa (kg/kg)
5RM;Carga (kg)
ROM rodilla flexión;Grados (°)
ROM rodilla extensión;Grados (°)
ROM tobillo dorsiflexión;Grados (°)
ROM tobillo dorsiflexión;Distancia (cm)
ROM cadera;Grados (°)
Sprint 10m;Tiempo (s)
Sprint 30m;Tiempo (s)
Velocidad máxima;Vmax (m/s)
Aceleración;Tiempo (s)
505;Tiempo (s)
505;Déficit COD (s)
Illinois;Tiempo (s)
Single hop;Distancia (cm)
Single hop;LSI (%)
Triple hop;Distancia (cm)
Triple hop;LSI (%)
Crossover hop;Distancia (cm)
Crossover hop;LSI (%)
ACL-RSI;Puntuación
IKDC;Puntuación
KOOS;Puntuación
VISA-A;Puntuación
LEFS;Puntuación
NPRS;Puntuación (0-10)`;
