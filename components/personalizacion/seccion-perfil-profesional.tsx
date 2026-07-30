"use client";

import { Building2 } from "lucide-react";
import { SeccionCard } from "./seccion-card";
import { CampoEditable } from "@/components/atletas/campo-editable";
import { useToast } from "@/components/shared/toast";
import { useConfig, useDispatch, type PerfilProfesional } from "@/lib/store";

export function SeccionPerfilProfesional() {
  const config = useConfig();
  const dispatch = useDispatch();
  const toast = useToast();

  function guardar(campo: keyof PerfilProfesional, valor: string) {
    dispatch({
      type: "CONFIG_ACTUALIZAR",
      payload: { perfilProfesional: { ...config.perfilProfesional, [campo]: valor } },
    });
    toast("Perfil profesional actualizado");
  }

  return (
    <SeccionCard
      id="perfil-profesional"
      title="Perfil profesional"
      description="Estos datos encabezan los informes que generes desde Clínica."
    >
      <div className="flex flex-col gap-5 sm:flex-row">
        <div className="flex size-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-borderSoft bg-bg text-muted">
          <Building2 className="size-8" />
        </div>
        <div className="min-w-0 flex-1">
          <CampoEditable
            label="Nombre"
            value={config.perfilProfesional.nombre}
            onGuardar={(v) => guardar("nombre", v)}
          />
          <CampoEditable label="Rol" value={config.perfilProfesional.rol} onGuardar={(v) => guardar("rol", v)} />
          <CampoEditable
            label="Nº de colegiado"
            value={config.perfilProfesional.numColegiado}
            onGuardar={(v) => guardar("numColegiado", v)}
          />
          <CampoEditable
            label="Clínica"
            value={config.perfilProfesional.clinica}
            onGuardar={(v) => guardar("clinica", v)}
          />
        </div>
      </div>
    </SeccionCard>
  );
}
