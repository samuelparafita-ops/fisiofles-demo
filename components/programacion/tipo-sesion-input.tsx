"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { useSesiones } from "@/lib/store";

/**
 * Input de texto corto para `Sesion.tipo` ("Gym", "Campo", "Readaptación"...)
 * con sugerencias vía `<datalist>` de los tipos ya usados en el store — no es
 * un enum cerrado, el fisio puede escribir cualquier cosa.
 */
export function TipoSesionInput({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (tipo: string) => void;
}) {
  const sesiones = useSesiones();
  const listId = `${id}-tipos`;

  const tiposUsados = useMemo(() => {
    const tipos = sesiones.map((s) => s.tipo).filter((t): t is string => Boolean(t?.trim()));
    return Array.from(new Set(tipos)).sort((a, b) => a.localeCompare(b));
  }, [sesiones]);

  return (
    <>
      <Input
        id={id}
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ej. Gym, Campo, Readaptación..."
      />
      <datalist id={listId}>
        {tiposUsados.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>
    </>
  );
}
