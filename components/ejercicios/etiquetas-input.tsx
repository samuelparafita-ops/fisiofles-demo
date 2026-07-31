"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";

const MAX_SUGERENCIAS = 8;

/**
 * Input de etiquetas libres — escribe + Enter (o clic en una sugerencia)
 * añade un chip, × lo quita. Las sugerencias vienen de las etiquetas YA
 * EXISTENTES en otros ejercicios (`sugerencias`), filtradas mientras se
 * escribe y sin las que ya están añadidas. Sin tope duro — el hint bajo el
 * input solo recomienda 4-5 (pedido literal del cliente).
 */
export function EtiquetasInput({
  id,
  value,
  onChange,
  sugerencias,
}: {
  id: string;
  value: string[];
  onChange: (next: string[]) => void;
  sugerencias: string[];
}) {
  const [texto, setTexto] = useState("");
  const [abierto, setAbierto] = useState(false);

  const sugerenciasFiltradas = useMemo(() => {
    const q = texto.trim().toLowerCase();
    const disponibles = sugerencias.filter(
      (s) => !value.some((v) => v.toLowerCase() === s.toLowerCase())
    );
    const filtradas = q ? disponibles.filter((s) => s.toLowerCase().includes(q)) : disponibles;
    return filtradas.slice(0, MAX_SUGERENCIAS);
  }, [texto, sugerencias, value]);

  function anadir(etiqueta: string) {
    const v = etiqueta.trim();
    setTexto("");
    if (!v || value.some((e) => e.toLowerCase() === v.toLowerCase())) return;
    onChange([...value, v]);
  }

  function quitar(etiqueta: string) {
    onChange(value.filter((e) => e !== etiqueta));
  }

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <input
          id={id}
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setAbierto(true);
          }}
          onFocus={() => setAbierto(true)}
          onBlur={() => setAbierto(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              anadir(texto);
            } else if (e.key === "Backspace" && texto === "" && value.length > 0) {
              quitar(value[value.length - 1]);
            }
          }}
          placeholder="Escribe una etiqueta y pulsa Enter..."
          aria-label="Añadir etiqueta"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        {abierto && sugerenciasFiltradas.length > 0 && (
          <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-borderSoft bg-surface2 py-1 shadow-lg">
            {sugerenciasFiltradas.map((s) => (
              <button
                key={s}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => anadir(s)}
                className="block w-full px-3 py-1.5 text-left text-sm text-textStrong transition-colors hover:bg-bg"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((etiqueta) => (
            <span
              key={etiqueta}
              className="flex items-center gap-1 rounded-full border border-brand/30 bg-brand-tint px-2 py-0.5 text-[11px] font-medium text-brand-ink"
            >
              {etiqueta}
              <button
                type="button"
                onClick={() => quitar(etiqueta)}
                aria-label={`Quitar etiqueta ${etiqueta}`}
                className="rounded-full transition-opacity hover:opacity-70"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-textDim">Recomendamos 4-5 etiquetas (zona, patrón, lesión típica...), sin límite.</p>
    </div>
  );
}
