"use client";

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { SeccionCard, CampoControl } from "./seccion-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/shared/toast";
import { useConfig, useDispatch, type UmbralesConfig } from "@/lib/store";
import { UMBRALES_DEFECTO, UMBRALES_DEFS, type UmbralDef } from "@/lib/personalizacion/umbrales";

/**
 * Validación cruzada (no solo min/max): acwrBajo < acwrAlto y
 * simetriaAceptable <= simetriaObjetivo, para que las bandas de los gráficos
 * (lib/calculations/acwr.ts `zonaAcwr` / simetria.ts `estadoSimetria`)
 * nunca reciban un rango invertido.
 */
function validar(def: UmbralDef, n: number, umbrales: UmbralesConfig): string | null {
  if (Number.isNaN(n)) return "Introduce un número.";
  if (n < def.min || n > def.max) return `Debe estar entre ${def.min} y ${def.max}.`;
  if (def.key === "acwrBajo" && n >= umbrales.acwrAlto) return "Debe ser menor que el ACWR alto.";
  if (def.key === "acwrAlto" && n <= umbrales.acwrBajo) return "Debe ser mayor que el ACWR bajo.";
  if (def.key === "simetriaAceptable" && n > umbrales.simetriaObjetivo) return "Debe ser menor o igual que la simetría objetivo.";
  if (def.key === "simetriaObjetivo" && n < umbrales.simetriaAceptable) return "Debe ser mayor o igual que la simetría aceptable.";
  return null;
}

function UmbralField({
  def,
  valor,
  umbrales,
  onGuardar,
}: {
  def: UmbralDef;
  valor: number;
  umbrales: UmbralesConfig;
  onGuardar: (v: number) => void;
}) {
  const [texto, setTexto] = useState(String(valor));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTexto(String(valor));
    setError(null);
  }, [valor]);

  function commit(raw: string) {
    const n = Number(raw);
    const err = validar(def, n, umbrales);
    setError(err);
    if (!err) onGuardar(n);
  }

  return (
    <CampoControl label={def.label} description={def.descripcion}>
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            inputMode="decimal"
            value={texto}
            min={def.min}
            max={def.max}
            step={def.step}
            aria-invalid={error ? true : undefined}
            className="h-9 w-24 text-right"
            onChange={(e) => setTexto(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
          />
          {def.unidad && <span className="text-sm text-textDim">{def.unidad}</span>}
        </div>
        {error && <p className="max-w-48 text-right text-xs text-state-bad">{error}</p>}
      </div>
    </CampoControl>
  );
}

export function SeccionVariablesCalculo() {
  const config = useConfig();
  const dispatch = useDispatch();
  const toast = useToast();

  function guardarUmbral(key: keyof UmbralesConfig, valor: number) {
    dispatch({ type: "CONFIG_ACTUALIZAR", payload: { umbrales: { ...config.umbrales, [key]: valor } } });
    toast("Umbral actualizado", "Gráficos y hallazgos se recalculan con el nuevo valor.");
  }

  function restaurar() {
    dispatch({ type: "CONFIG_ACTUALIZAR", payload: { umbrales: { ...UMBRALES_DEFECTO } } });
    toast("Valores por defecto restaurados");
  }

  return (
    <SeccionCard
      id="variables-calculo"
      title="Variables de cálculo"
      description="Umbrales clínicos que alimentan las bandas de los gráficos y el motor de hallazgos."
    >
      <div className="mb-4 rounded-lg border border-borderSoft bg-bg px-4 py-3 text-xs text-textDim">
        Esto ajusta las visualizaciones y las alertas de la demo — no es un consejo clínico ni sustituye el criterio del profesional.
      </div>

      <div>
        {UMBRALES_DEFS.map((def) => (
          <UmbralField
            key={def.key}
            def={def}
            valor={config.umbrales[def.key]}
            umbrales={config.umbrales}
            onGuardar={(v) => guardarUmbral(def.key, v)}
          />
        ))}
      </div>

      <div className="mt-5 flex justify-end border-t border-borderSoft pt-4">
        <Button type="button" variant="outline" size="sm" onClick={restaurar}>
          <RotateCcw className="size-3.5" />
          Restaurar valores por defecto
        </Button>
      </div>
    </SeccionCard>
  );
}
