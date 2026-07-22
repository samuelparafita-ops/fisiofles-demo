"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/components/shared/toast";
import { hoyIso } from "@/components/atletas/ficha/fecha-utils";
import { FormularioCamposPreview } from "@/components/formularios/formulario-campos-preview";
import {
  accionActualizar,
  accionCrear,
  useAtleta,
  useDispatch,
  type FormularioDef,
  type FormularioEnvio,
  type RegistroTest,
  type ValorCuestionario,
  type VariableDestino,
} from "@/lib/store";

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

    // Formulario vinculado a un test PRO del catálogo: la respuesta también
    // genera un RegistroTest (puntuación = media de los campos escala 0-10,
    // llevada a 0-100), visible en el histórico de tests del atleta.
    let generoRegistroTest = false;
    if (formulario.testDefId) {
      const camposEscala = formulario.campos.filter((c) => c.tipo === "escala-0-10");
      if (camposEscala.length > 0) {
        const media =
          camposEscala.reduce((acc, c) => acc + (Number(respuestas[c.id]) || 0), 0) / camposEscala.length;
        const valores: ValorCuestionario = { puntuacion: Math.round(media * 10) };
        const nuevoRegistro: RegistroTest = {
          id: `reg-${Date.now().toString(36)}`,
          atletaId: atleta.id,
          testId: formulario.testDefId,
          fecha: hoy,
          valores,
        };
        dispatch(accionCrear("registrosTests", nuevoRegistro));
        generoRegistroTest = true;
      }
    }

    toast(
      "Respuesta registrada",
      generoRegistroTest
        ? `${formulario.nombre} respondido — se ha añadido el punto a Evolución y un nuevo registro de test.`
        : huboCambiosEvolucion
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

          <FormularioCamposPreview
            campos={formulario.campos}
            respuestas={respuestas}
            onChange={actualizarCampo}
          />
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
