"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type Dispatch,
  type ReactNode,
} from "react";
import { buildSeed } from "@/lib/mock/seed";
import { reducer, type Action } from "./reducer";
import type { AppState } from "./types";

export const STORAGE_KEY = "fisiofles-demo-v2";
const PERSIST_DEBOUNCE_MS = 300;

type StoreContextValue = {
  state: AppState;
  dispatch: Dispatch<Action>;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  // Init function: se ejecuta una vez, de forma síncrona, tanto en servidor
  // como en cliente → el primer render (SSR incluido) usa siempre la semilla.
  const [state, dispatch] = useReducer(reducer, undefined, buildSeed);

  const hidratado = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Hidratación desde localStorage — solo en cliente, tras el primer render.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        dispatch({ type: "HYDRATE", payload: JSON.parse(raw) as AppState });
      }
    } catch {
      // localStorage corrupto o inaccesible: seguimos con la semilla.
    } finally {
      hidratado.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persistencia con debounce en cada cambio de estado (tras hidratar).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hidratado.current) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Cuota de localStorage excedida u otro fallo: no es crítico en demo.
      }
    }, PERSIST_DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore debe usarse dentro de <StoreProvider>");
  return ctx;
}

/** Borra la persistencia y re-siembra el estado desde cero. */
export function resetDemo(dispatch: Dispatch<Action>) {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  dispatch({ type: "RESET_DEMO" });
}
