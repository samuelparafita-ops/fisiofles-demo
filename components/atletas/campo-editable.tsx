"use client";

import { useEffect, useState } from "react";
import { Check, Pencil, X } from "lucide-react";

type TipoCampo = "text" | "email" | "tel" | "date" | "select" | "textarea";

/**
 * Patrón "valor + icono lápiz → input → guardar en store" reutilizado por
 * todos los campos editables del tab General (CLAUDE.md > única fuente de
 * verdad: el guardado real lo hace el `onGuardar` que pasa el padre).
 */
export function CampoEditable({
  label,
  value,
  onGuardar,
  tipo = "text",
  opciones,
  placeholder,
  formatoDisplay,
}: {
  label: string;
  value: string;
  onGuardar: (nuevoValor: string) => void;
  tipo?: TipoCampo;
  opciones?: { value: string; label: string }[];
  placeholder?: string;
  formatoDisplay?: (value: string) => string;
}) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(value);

  useEffect(() => {
    if (!editando) setValor(value);
  }, [value, editando]);

  function guardar() {
    onGuardar(valor);
    setEditando(false);
  }

  function cancelar() {
    setValor(value);
    setEditando(false);
  }

  if (!editando) {
    return (
      <div className="flex items-center justify-between gap-2 border-b border-borderSoft py-2.5 last:border-0">
        <div className="min-w-0">
          <p className="text-xs text-textDim">{label}</p>
          <p className="mt-0.5 truncate text-sm text-textStrong">
            {value ? (formatoDisplay ? formatoDisplay(value) : value) : "—"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditando(true)}
          className="shrink-0 rounded-md p-1.5 text-textDim transition-colors hover:bg-bg hover:text-brand-ink"
          aria-label={`Editar ${label}`}
        >
          <Pencil className="size-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="border-b border-borderSoft py-2.5 last:border-0">
      <p className="mb-1 text-xs text-textDim">{label}</p>
      <div className="flex items-start gap-2">
        {tipo === "select" ? (
          <select
            autoFocus
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {opciones?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ) : tipo === "textarea" ? (
          <textarea
            autoFocus
            rows={3}
            value={valor}
            placeholder={placeholder}
            onChange={(e) => setValor(e.target.value)}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        ) : (
          <input
            autoFocus
            type={tipo}
            value={valor}
            placeholder={placeholder}
            onChange={(e) => setValor(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") guardar();
              if (e.key === "Escape") cancelar();
            }}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        )}
        <button
          type="button"
          onClick={guardar}
          className="shrink-0 rounded-md bg-brand-tint p-1.5 text-brand-ink transition-colors hover:bg-brand hover:text-white"
          aria-label="Guardar"
        >
          <Check className="size-4" />
        </button>
        <button
          type="button"
          onClick={cancelar}
          className="shrink-0 rounded-md p-1.5 text-textDim transition-colors hover:bg-bg"
          aria-label="Cancelar"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
