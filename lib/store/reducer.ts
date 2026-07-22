/**
 * Reducer genérico del store. Cada entidad con identidad propia (atletas,
 * sesiones, bloques...) comparte las mismas 3 operaciones (crear/actualizar/
 * eliminar) vía un único action-type indexado por entidad, en vez de 30
 * action-types casi idénticos — ver `EntityMap`/`Action` más abajo.
 */

import type { Ejercicio } from "@/lib/mock/ejercicios";
import { buildSeed } from "@/lib/mock/seed";
import type {
  Atleta,
  BloqueSemanal,
  Config,
  FormularioDef,
  FormularioEnvio,
  Notificacion,
  PlantillaPrograma,
  PlantillaSesion,
  RegistroTest,
  Sesion,
  TestDef,
  AppState,
} from "./types";

export type EntityMap = {
  atletas: Atleta;
  sesiones: Sesion;
  bloques: BloqueSemanal;
  ejercicios: Ejercicio;
  catalogoTests: TestDef;
  registrosTests: RegistroTest;
  plantillasSesion: PlantillaSesion;
  plantillasPrograma: PlantillaPrograma;
  formulariosDef: FormularioDef;
  formulariosEnvios: FormularioEnvio;
  notificaciones: Notificacion;
};

export type EntityKey = keyof EntityMap;

type CrudAction = {
  [K in EntityKey]:
    | { type: "CREAR"; entidad: K; payload: EntityMap[K] }
    | {
        type: "ACTUALIZAR";
        entidad: K;
        payload: { id: string; patch: Partial<EntityMap[K]> };
      }
    | { type: "ELIMINAR"; entidad: K; payload: { id: string } };
}[EntityKey];

export type Action =
  | CrudAction
  | { type: "CONFIG_ACTUALIZAR"; payload: Partial<Config> }
  | { type: "RESET_DEMO" }
  | { type: "HYDRATE"; payload: AppState };

// Los `as Action` son necesarios porque TS no estrecha un discriminated
// union genérico indexado por `K` al construir el objeto — la forma es
// correcta por construcción (K liga `entidad` y `payload` en la llamada).

export function accionCrear<K extends EntityKey>(
  entidad: K,
  payload: EntityMap[K]
): Action {
  return { type: "CREAR", entidad, payload } as Action;
}

export function accionActualizar<K extends EntityKey>(
  entidad: K,
  id: string,
  patch: Partial<EntityMap[K]>
): Action {
  return { type: "ACTUALIZAR", entidad, payload: { id, patch } } as Action;
}

export function accionEliminar<K extends EntityKey>(entidad: K, id: string): Action {
  return { type: "ELIMINAR", entidad, payload: { id } } as Action;
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "CREAR": {
      const lista = state[action.entidad] as unknown as { id: string }[];
      return { ...state, [action.entidad]: [...lista, action.payload] };
    }
    case "ACTUALIZAR": {
      const { id, patch } = action.payload;
      const lista = state[action.entidad] as unknown as { id: string }[];
      return {
        ...state,
        [action.entidad]: lista.map((item) =>
          item.id === id ? { ...item, ...patch } : item
        ),
      };
    }
    case "ELIMINAR": {
      const lista = state[action.entidad] as unknown as { id: string }[];
      return {
        ...state,
        [action.entidad]: lista.filter((item) => item.id !== action.payload.id),
      };
    }
    case "CONFIG_ACTUALIZAR":
      return { ...state, config: { ...state.config, ...action.payload } };
    case "RESET_DEMO":
      return buildSeed();
    case "HYDRATE":
      return action.payload;
    default:
      return state;
  }
}
