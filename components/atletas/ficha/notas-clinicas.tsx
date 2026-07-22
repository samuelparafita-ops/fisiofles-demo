"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { accionActualizar, useDispatch, type Atleta } from "@/lib/store";
import { fmtFechaLarga, hoyIso } from "@/components/atletas/ficha/fecha-utils";

export function NotasClinicas({ atleta }: { atleta: Atleta }) {
  const dispatch = useDispatch();
  const [texto, setTexto] = useState("");
  const notas = [...atleta.notas].sort((a, b) => b.fecha.localeCompare(a.fecha));

  function anadirNota() {
    const contenido = texto.trim();
    if (!contenido) return;
    dispatch(
      accionActualizar("atletas", atleta.id, {
        notas: [...atleta.notas, { id: `nota-${Date.now().toString(36)}`, fecha: hoyIso(), texto: contenido }],
      })
    );
    setTexto("");
  }

  return (
    <div className="rounded-xl border border-borderSoft bg-surface2 p-6 shadow-sm">
      <h3 className="font-display text-base font-bold text-textStrong">Notas clínicas</h3>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start">
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Añadir una nota clínica..."
          rows={2}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <Button type="button" onClick={anadirNota} disabled={!texto.trim()} className="shrink-0">
          <Plus className="size-3.5" />
          Añadir nota
        </Button>
      </div>

      {notas.length === 0 ? (
        <p className="mt-4 text-sm text-textDim">Sin notas registradas todavía.</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {notas.map((nota) => (
            <li key={nota.id} className="rounded-lg border border-borderSoft bg-bg p-3">
              <p className="text-xs font-medium text-textDim">{fmtFechaLarga(nota.fecha)}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-text">{nota.texto}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
