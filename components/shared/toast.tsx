"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Toast = { id: number; message: string; description?: string };

const ToastContext = createContext<((message: string, description?: string) => void) | null>(
  null
);

const DURATION_MS = 3200;

/**
 * Toast mínimo sin dependencias nuevas (no hay backend real que confirmar,
 * solo feedback visual de acciones "demo").
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, description?: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, DURATION_MS);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed bottom-4 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 sm:bottom-6 sm:left-auto sm:right-6 sm:translate-x-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-2.5 rounded-lg border border-borderSoft bg-surface2 px-4 py-3 shadow-lg",
              "animate-in slide-in-from-bottom-2 fade-in-0 duration-200"
            )}
          >
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-state-good" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-textStrong">{t.message}</p>
              {t.description && <p className="mt-0.5 text-xs text-textDim">{t.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return toast;
}
