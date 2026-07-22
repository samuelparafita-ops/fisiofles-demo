"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EjerciciosSesionEditor } from "@/components/atletas/ficha/ejercicios-sesion-editor";
import {
  DIAS_SEMANA,
  usePlantillasSesion,
  type DiaSemana,
  type EjercicioProgramado,
  type PlantillaPrograma,
} from "@/lib/store";

const campoClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

type SesionSemana = PlantillaPrograma["semanas"][number]["sesiones"][number];

/**
 * Sesiones de una semana dentro del editor de PlantillaPrograma — se añaden
 * eligiendo una PlantillaSesion existente (precarga nombre+ejercicios) o
 * creando una ad hoc, reusando `EjerciciosSesionEditor`.
 */
export function SesionSemanaEditor({
  sesiones,
  onChange,
}: {
  sesiones: SesionSemana[];
  onChange: (next: SesionSemana[]) => void;
}) {
  const plantillasSesion = usePlantillasSesion();
  const [creando, setCreando] = useState(false);
  const [dia, setDia] = useState<DiaSemana>("Lunes");
  const [nombre, setNombre] = useState("");
  const [plantillaId, setPlantillaId] = useState("");
  const [ejercicios, setEjercicios] = useState<EjercicioProgramado[]>([]);

  function resetForm() {
    setDia("Lunes");
    setNombre("");
    setPlantillaId("");
    setEjercicios([]);
    setCreando(false);
  }

  function elegirPlantilla(id: string) {
    setPlantillaId(id);
    if (!id) return;
    const p = plantillasSesion.find((pp) => pp.id === id);
    if (p) {
      setNombre(p.nombre);
      setEjercicios(p.ejercicios);
    }
  }

  function anadirSesion() {
    if (!nombre.trim()) return;
    onChange([...sesiones, { dia, nombre: nombre.trim(), ejercicios, estado: "programada" }]);
    resetForm();
  }

  function quitarSesion(i: number) {
    onChange(sesiones.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-3">
      {sesiones.length === 0 && !creando && (
        <p className="text-sm text-textDim">Sin sesiones en esta semana todavía.</p>
      )}

      {sesiones.map((s, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-2 rounded-md border border-borderSoft bg-surface2 px-3 py-2"
        >
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink">{s.dia}</p>
            <p className="truncate text-sm font-medium text-textStrong">{s.nombre}</p>
            <p className="text-xs text-textDim">{s.ejercicios.length} ejercicios</p>
          </div>
          <button
            type="button"
            onClick={() => quitarSesion(i)}
            className="shrink-0 rounded-md p-1.5 text-textDim transition-colors hover:bg-state-bad/10 hover:text-state-bad"
            aria-label="Quitar sesión de la semana"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}

      {creando ? (
        <div className="space-y-3 rounded-lg border border-borderSoft bg-surface2 p-3">
          <div className="grid grid-cols-2 gap-2">
            <select
              value={dia}
              onChange={(e) => setDia(e.target.value as DiaSemana)}
              className={campoClass}
              aria-label="Día de la semana"
            >
              {DIAS_SEMANA.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre de la sesión"
              aria-label="Nombre de la sesión"
              className={campoClass}
            />
          </div>

          {plantillasSesion.length > 0 && (
            <select
              value={plantillaId}
              onChange={(e) => elegirPlantilla(e.target.value)}
              className={campoClass}
              aria-label="Partir de una plantilla de sesión"
            >
              <option value="">Sesión ad hoc (sin plantilla)</option>
              {plantillasSesion.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          )}

          <EjerciciosSesionEditor ejercicios={ejercicios} onChange={setEjercicios} />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={resetForm}>
              Cancelar
            </Button>
            <Button type="button" size="sm" onClick={anadirSesion} disabled={!nombre.trim()}>
              Añadir a la semana
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={() => setCreando(true)}>
          <Plus className="size-3.5" />
          Añadir sesión
        </Button>
      )}
    </div>
  );
}
