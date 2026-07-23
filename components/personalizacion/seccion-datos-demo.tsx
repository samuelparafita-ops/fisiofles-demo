"use client";

import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { SeccionCard, CampoControl } from "./seccion-card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/shared/toast";
import { resetDemo, useDispatch } from "@/lib/store";

/** Misma acción que "Restablecer demo"/"Reiniciar demo" del menú del avatar (components/layout/topbar.tsx) — se deja también aquí porque es el sitio natural para encontrarla. */
export function SeccionDatosDemo() {
  const dispatch = useDispatch();
  const toast = useToast();
  const router = useRouter();

  function handleRestablecer() {
    resetDemo(dispatch);
    toast("Demo restablecida", "Todos los datos se han vuelto a sembrar desde cero.");
    router.push("/");
  }

  return (
    <SeccionCard
      id="datos-demo"
      title="Datos de la demo"
      description="Esta es una demo sin backend: todo vive en el navegador."
    >
      <CampoControl
        label="Restablecer demo"
        description="Borra todos los cambios (atletas, sesiones, config...) y vuelve a sembrar los datos ficticios originales. No se puede deshacer."
      >
        <Button type="button" variant="outline" size="sm" onClick={handleRestablecer}>
          <RotateCcw className="size-3.5" />
          Restablecer demo
        </Button>
      </CampoControl>
    </SeccionCard>
  );
}
