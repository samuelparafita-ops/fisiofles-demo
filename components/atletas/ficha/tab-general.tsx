"use client";

import { CampoEditable } from "@/components/atletas/campo-editable";
import { FASE_OPCIONES } from "@/components/atletas/fase-utils";
import { Timeline } from "@/components/atletas/ficha/timeline";
import { NotasClinicas } from "@/components/atletas/ficha/notas-clinicas";
import { accionActualizar, useDispatch, type Atleta, type EstadoAtleta } from "@/lib/store";

const ESTADO_OPCIONES: { value: EstadoAtleta; label: string }[] = [
  { value: "activo", label: "Activo" },
  { value: "alta", label: "Alta" },
  { value: "pausa", label: "Pausa" },
];

function fmtFechaDisplay(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function TabGeneral({ atleta }: { atleta: Atleta }) {
  const dispatch = useDispatch();

  function guardar(patch: Partial<Atleta>) {
    dispatch(accionActualizar("atletas", atleta.id, patch));
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div className="rounded-xl border border-borderSoft bg-surface2 p-6 shadow-sm">
        <h3 className="font-display text-base font-bold text-textStrong">Datos personales</h3>
        <div className="mt-3">
          <CampoEditable label="Nombre" value={atleta.nombre} onGuardar={(v) => guardar({ nombre: v })} />
          <CampoEditable
            label="Email"
            value={atleta.email ?? ""}
            tipo="email"
            placeholder="atleta@example.com"
            onGuardar={(v) => guardar({ email: v || undefined })}
          />
          <CampoEditable
            label="Teléfono"
            value={atleta.telefono ?? ""}
            tipo="tel"
            placeholder="+34 600 000 000"
            onGuardar={(v) => guardar({ telefono: v || undefined })}
          />
          <CampoEditable
            label="Fecha de nacimiento"
            value={atleta.fechaNacimiento ?? ""}
            tipo="date"
            formatoDisplay={fmtFechaDisplay}
            onGuardar={(v) => guardar({ fechaNacimiento: v || undefined })}
          />
        </div>
      </div>

      <div className="rounded-xl border border-borderSoft bg-surface2 p-6 shadow-sm">
        <h3 className="font-display text-base font-bold text-textStrong">Datos clínicos</h3>
        <div className="mt-3">
          <CampoEditable label="Deporte" value={atleta.deporte} onGuardar={(v) => guardar({ deporte: v })} />
          <CampoEditable label="Lesión" value={atleta.lesion} onGuardar={(v) => guardar({ lesion: v })} />
          <CampoEditable
            label="Detalle de la lesión"
            value={atleta.lesionDetalle ?? ""}
            tipo="textarea"
            onGuardar={(v) => guardar({ lesionDetalle: v || undefined })}
          />
          <CampoEditable
            label="Fase"
            value={atleta.fase}
            tipo="select"
            opciones={FASE_OPCIONES.map((f) => ({ value: f, label: f }))}
            onGuardar={(v) => guardar({ fase: v })}
          />
          <CampoEditable
            label="Fecha de inicio de tratamiento"
            value={atleta.fechaInicioTratamiento ?? ""}
            tipo="date"
            formatoDisplay={fmtFechaDisplay}
            onGuardar={(v) => guardar({ fechaInicioTratamiento: v || undefined })}
          />
          <CampoEditable
            label="Estado"
            value={atleta.estado}
            tipo="select"
            opciones={ESTADO_OPCIONES}
            formatoDisplay={(v) => ESTADO_OPCIONES.find((o) => o.value === v)?.label ?? v}
            onGuardar={(v) => guardar({ estado: v as EstadoAtleta })}
          />
        </div>
      </div>

      <div className="xl:col-span-2">
        <Timeline atleta={atleta} />
      </div>

      <div className="xl:col-span-2">
        <NotasClinicas atleta={atleta} />
      </div>
    </div>
  );
}
