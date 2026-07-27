"use client";

import { useState } from "react";
import { ChevronDown, ScanFace } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EmptyState } from "@/components/shared/empty-state";
import { RadarPerfil } from "@/components/charts";
import { CampoEditable } from "@/components/atletas/campo-editable";
import { FASE_OPCIONES } from "@/components/atletas/fase-utils";
import {
  accionActualizar,
  useDispatch,
  useEntrenadores,
  type Atleta,
  type Capacidad,
  type EstadoAtleta,
} from "@/lib/store";

const SIN_ASIGNAR = "sin-asignar";
const MIN_EJES = 3;

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

function AnamnesisDialog({ atleta, open, onOpenChange }: { atleta: Atleta; open: boolean; onOpenChange: (v: boolean) => void }) {
  const preguntas = atleta.anamnesis ?? [];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Anamnesis</DialogTitle>
          <DialogDescription>Cuestionario inicial de {atleta.nombre} — solo lectura.</DialogDescription>
        </DialogHeader>
        {preguntas.length === 0 ? (
          <p className="mt-4 text-sm text-textDim">Este atleta no tiene anamnesis registrada.</p>
        ) : (
          <div className="mt-2 space-y-4">
            {preguntas.map((p, i) => (
              <div key={i} className="border-b border-borderSoft pb-3 last:border-0">
                <p className="text-sm font-semibold text-textStrong">{p.pregunta}</p>
                <p className="mt-1 text-sm text-textDim">{p.respuesta}</p>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Popover de checkboxes para elegir qué ejes del radar se muestran (mínimo 3). */
function SelectorEjesRadar({
  ejesDisponibles,
  seleccionados,
  onChange,
}: {
  ejesDisponibles: Capacidad[];
  seleccionados: Capacidad[];
  onChange: (next: Capacidad[]) => void;
}) {
  function toggle(eje: Capacidad) {
    const activo = seleccionados.includes(eje);
    if (activo && seleccionados.length <= MIN_EJES) return;
    onChange(activo ? seleccionados.filter((e) => e !== eje) : [...seleccionados, eje]);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full border border-borderSoft px-2.5 py-1 text-[11px] font-medium text-textDim transition-colors hover:border-brand/50 hover:text-textStrong"
        >
          Capacidades
          <span className="rounded-full bg-brand-tint px-1.5 py-0.5 text-[11px] font-semibold text-brand-ink">
            {seleccionados.length}/{ejesDisponibles.length}
          </span>
          <ChevronDown className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <p className="mb-2 text-xs text-textDim">Mínimo {MIN_EJES} capacidades.</p>
        <div className="max-h-64 space-y-0.5 overflow-y-auto">
          {ejesDisponibles.map((eje) => {
            const activo = seleccionados.includes(eje);
            return (
              <label
                key={eje}
                className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-bg"
              >
                <input
                  type="checkbox"
                  checked={activo}
                  onChange={() => toggle(eje)}
                  disabled={activo && seleccionados.length <= MIN_EJES}
                  className="size-4 shrink-0 accent-brand disabled:opacity-40"
                />
                <span className="truncate text-sm text-textStrong">{eje}</span>
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Bloque fusionado "Datos personales + clínicos" — vive fuera de las tabs,
 * siempre visible bajo `FichaHeader` (FASE 7). Los ejes del radar
 * seleccionados quedan en estado LOCAL (no en `config`): es una preferencia
 * de visualización puntual del fisio mirando esta ficha, no un umbral
 * clínico ni un dato editable del atleta, así que no pertenece a
 * `state.config` — se reinicia (a "todos") al salir de la ficha.
 */
export function DatosGeneralesFicha({ atleta }: { atleta: Atleta }) {
  const dispatch = useDispatch();
  const entrenadores = useEntrenadores();
  const [colapsado, setColapsado] = useState(false);
  const [anamnesisOpen, setAnamnesisOpen] = useState(false);

  const ejesDisponibles = atleta.perfilFisico.map((p) => p.eje);
  const [ejesSeleccionados, setEjesSeleccionados] = useState<Capacidad[]>(ejesDisponibles);

  function guardar(patch: Partial<Atleta>) {
    dispatch(accionActualizar("atletas", atleta.id, patch));
  }

  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-borderSoft bg-surface2 shadow-sm">
      <button
        type="button"
        onClick={() => setColapsado((c) => !c)}
        className="flex w-full items-center justify-between gap-3 px-6 py-4 text-left"
      >
        <h3 className="font-display text-base font-bold text-textStrong">Datos generales</h3>
        <ChevronDown
          className={`size-4 shrink-0 text-textDim transition-transform ${colapsado ? "" : "rotate-180"}`}
        />
      </button>

      {!colapsado && (
        <div className="grid grid-cols-1 gap-6 border-t border-borderSoft p-6 xl:grid-cols-2">
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-textStrong">Datos personales y clínicos</p>
              <Button type="button" variant="outline" size="sm" onClick={() => setAnamnesisOpen(true)}>
                Ver anamnesis
              </Button>
            </div>
            <div className="mt-2">
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
              <CampoEditable
                label="Entrenador"
                value={atleta.entrenadorId ?? SIN_ASIGNAR}
                tipo="select"
                opciones={[
                  { value: SIN_ASIGNAR, label: "Sin asignar" },
                  ...entrenadores.map((e) => ({ value: e.id, label: `${e.nombre} · ${e.rol}` })),
                ]}
                formatoDisplay={(v) => entrenadores.find((e) => e.id === v)?.nombre ?? "Sin asignar"}
                onGuardar={(v) => guardar({ entrenadorId: v === SIN_ASIGNAR ? undefined : v })}
              />
            </div>
          </div>

          <div>
            {atleta.perfilFisico.length > 0 ? (
              <RadarPerfil
                perfilFisico={atleta.perfilFisico}
                sexo={atleta.sexo}
                ejesVisibles={ejesSeleccionados}
                accionExtra={
                  <SelectorEjesRadar
                    ejesDisponibles={ejesDisponibles}
                    seleccionados={ejesSeleccionados}
                    onChange={setEjesSeleccionados}
                  />
                }
              />
            ) : (
              <EmptyState
                icon={ScanFace}
                title="Perfil físico incompleto"
                description="Este atleta todavía no tiene medidas suficientes para el radar de perfil físico."
              />
            )}
          </div>
        </div>
      )}

      <AnamnesisDialog atleta={atleta} open={anamnesisOpen} onOpenChange={setAnamnesisOpen} />
    </div>
  );
}
