"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/components/shared/toast";
import { cn } from "@/lib/utils";
import { hoyIso } from "@/components/atletas/ficha/fecha-utils";
import {
  accionActualizar,
  useAtleta,
  useDispatch,
  type FormularioDef,
  type FormularioEnvio,
  type VariableDestino,
} from "@/lib/store";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

/**
 * Vista previa (~420px, ancho de móvil) de lo que rellenaría el atleta. Al
 * enviar: guarda la respuesta y, si algún campo tiene `variableDestino`,
 * añade/actualiza el punto de hoy en `atleta.evolucion` — el tab Datos lo
 * muestra al instante en el gráfico de Evolución.
 */
export function SimularRespuestaDialog({
  envio,
  formulario,
  onClose,
}: {
  envio: FormularioEnvio;
  formulario: FormularioDef;
  onClose: () => void;
}) {
  const dispatch = useDispatch();
  const toast = useToast();
  const atleta = useAtleta(envio.atletaId);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});

  function actualizarCampo(id: string, valor: string) {
    setRespuestas((r) => ({ ...r, [id]: valor }));
  }

  function enviar() {
    if (!atleta) return;

    const respuestasFinal: Record<string, string | number> = {};
    const cambios: Partial<Record<Exclude<VariableDestino, null>, number>> = {};

    for (const campo of formulario.campos) {
      const valorRaw = respuestas[campo.id] ?? "";
      const esNumerico = campo.tipo === "escala-0-10" || campo.tipo === "numero";
      const valorFinal: string | number = esNumerico ? Number(valorRaw) || 0 : valorRaw;
      respuestasFinal[campo.id] = valorFinal;
      if (campo.variableDestino) {
        cambios[campo.variableDestino] = Number(valorFinal) || 0;
      }
    }

    const hoy = hoyIso();
    dispatch(
      accionActualizar("formulariosEnvios", envio.id, {
        estado: "respondido",
        respuestas: respuestasFinal,
        fechaRespuesta: hoy,
      })
    );

    const huboCambiosEvolucion = Object.keys(cambios).length > 0;
    if (huboCambiosEvolucion) {
      const evolucionActual = atleta.evolucion;
      const ultimo = evolucionActual[evolucionActual.length - 1];
      const base = ultimo ?? { fecha: hoy, dolor: 0, carga: 0, rpe: 0 };
      const nuevoPunto = { ...base, ...cambios, fecha: hoy };
      const nuevaEvolucion =
        ultimo && ultimo.fecha === hoy
          ? [...evolucionActual.slice(0, -1), nuevoPunto]
          : [...evolucionActual, nuevoPunto];
      dispatch(accionActualizar("atletas", atleta.id, { evolucion: nuevaEvolucion }));
    }

    toast(
      "Respuesta registrada",
      huboCambiosEvolucion
        ? `${formulario.nombre} respondido — se ha añadido el punto a Evolución.`
        : `${formulario.nombre} respondido.`
    );
    onClose();
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[420px] overflow-hidden p-0">
        <div className="border-b border-borderSoft bg-bg px-5 py-4">
          <p className="text-xs font-medium text-textDim">Vista previa · móvil del atleta</p>
          <p className="mt-0.5 font-display text-base font-bold text-textStrong">{formulario.nombre}</p>
        </div>

        <div className="max-h-[60vh] space-y-5 overflow-y-auto px-5 py-5">
          <p className="text-sm text-textDim">{formulario.descripcion}</p>

          {formulario.campos.map((campo) => (
            <div key={campo.id} className="space-y-2">
              <Label>{campo.etiqueta}</Label>

              {campo.tipo === "escala-0-10" && (
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: 11 }, (_, n) => n).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => actualizarCampo(campo.id, String(n))}
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
                  onChange={(e) => actualizarCampo(campo.id, e.target.value)}
                />
              )}

              {campo.tipo === "texto" && (
                <Input
                  value={respuestas[campo.id] ?? ""}
                  onChange={(e) => actualizarCampo(campo.id, e.target.value)}
                />
              )}

              {campo.tipo === "seleccion" && (
                <select
                  value={respuestas[campo.id] ?? ""}
                  onChange={(e) => actualizarCampo(campo.id, e.target.value)}
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

        <div className="flex gap-2 border-t border-borderSoft px-5 py-4">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" className="flex-1" onClick={enviar}>
            Enviar respuesta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
