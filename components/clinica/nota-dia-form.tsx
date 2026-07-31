"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Atleta } from "@/lib/store";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

const SIN_ATLETA = "";

export type NotaDiaValor = { texto: string; atletaId?: string };

/** Alta/edición de una nota de calendario — texto libre + atleta opcional. Mismo formulario para crear y editar (`valorInicial`). */
export function NotaDiaForm({
  atletas,
  valorInicial,
  onGuardar,
  onCancelar,
}: {
  atletas: Atleta[];
  valorInicial?: NotaDiaValor;
  onGuardar: (valor: NotaDiaValor) => void;
  onCancelar: () => void;
}) {
  const [texto, setTexto] = useState(valorInicial?.texto ?? "");
  const [atletaId, setAtletaId] = useState(valorInicial?.atletaId ?? SIN_ATLETA);
  const atletasOrdenados = [...atletas].sort((a, b) => a.nombre.localeCompare(b.nombre));

  function guardar() {
    const contenido = texto.trim();
    if (!contenido) return;
    onGuardar({ texto: contenido, atletaId: atletaId || undefined });
  }

  return (
    <div className="space-y-2 rounded-lg border border-borderSoft bg-bg p-2.5">
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Ej. Marcos se va de vacaciones"
        rows={2}
        autoFocus
        className="flex w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      <select
        value={atletaId}
        onChange={(e) => setAtletaId(e.target.value)}
        className={selectClass}
        aria-label="Atleta ligado a la nota (opcional)"
      >
        <option value={SIN_ATLETA}>Sin atleta</option>
        {atletasOrdenados.map((a) => (
          <option key={a.id} value={a.id}>
            {a.nombre}
          </option>
        ))}
      </select>
      <div className="flex justify-end gap-1.5">
        <Button type="button" variant="outline" size="sm" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="button" size="sm" onClick={guardar} disabled={!texto.trim()}>
          Guardar
        </Button>
      </div>
    </div>
  );
}
