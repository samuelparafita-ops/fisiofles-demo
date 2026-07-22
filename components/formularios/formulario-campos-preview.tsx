"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { CampoFormulario } from "@/lib/store";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

/**
 * Renderiza los campos de un formulario tal como los rellenaría el atleta —
 * compartido por `SimularRespuestaDialog` (relleno real, guarda en el store)
 * y la vista previa en vivo del builder (relleno de mentira, solo visual).
 */
export function FormularioCamposPreview({
  campos,
  respuestas,
  onChange,
}: {
  campos: CampoFormulario[];
  respuestas: Record<string, string>;
  onChange: (id: string, valor: string) => void;
}) {
  return (
    <div className="space-y-5">
      {campos.map((campo) => (
        <div key={campo.id} className="space-y-2">
          <Label>{campo.etiqueta || "Campo sin etiqueta"}</Label>

          {campo.tipo === "escala-0-10" && (
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 11 }, (_, n) => n).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onChange(campo.id, String(n))}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                    respuestas[campo.id] === String(n)
                      ? "border-brand bg-brand text-white"
                      : "border-borderSoft text-textDim hover:border-brand/50"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          )}

          {campo.tipo === "numero" && (
            <Input
              type="number"
              value={respuestas[campo.id] ?? ""}
              onChange={(e) => onChange(campo.id, e.target.value)}
            />
          )}

          {campo.tipo === "texto" && (
            <Input
              value={respuestas[campo.id] ?? ""}
              onChange={(e) => onChange(campo.id, e.target.value)}
            />
          )}

          {campo.tipo === "seleccion" && (
            <select
              value={respuestas[campo.id] ?? ""}
              onChange={(e) => onChange(campo.id, e.target.value)}
              className={selectClass}
            >
              <option value="">Selecciona...</option>
              {campo.opciones?.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}
    </div>
  );
}
