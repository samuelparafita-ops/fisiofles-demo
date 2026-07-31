"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Search, UserRound } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EmptyState } from "@/components/shared/empty-state";
import { AtletaAvatar } from "@/components/atletas/atleta-avatar";
import { TabProgramacion } from "@/components/atletas/ficha/tab-programacion";
import { useAtletas, type Atleta } from "@/lib/store";

function SelectorAtletaUnico({
  atletas,
  seleccionado,
  onSeleccionar,
}: {
  atletas: Atleta[];
  seleccionado: Atleta | undefined;
  onSeleccionar: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return q ? atletas.filter((a) => a.nombre.toLowerCase().includes(q)) : atletas;
  }, [atletas, busqueda]);

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setBusqueda("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-lg border border-borderSoft bg-surface2 px-3 py-2 text-left text-sm shadow-sm transition-colors hover:border-brand/50"
        >
          {seleccionado ? (
            <>
              <AtletaAvatar atleta={seleccionado} size="sm" />
              <span className="min-w-0 flex-1 truncate font-medium text-textStrong">{seleccionado.nombre}</span>
            </>
          ) : (
            <>
              <Search className="size-4 text-textDim" />
              <span className="flex-1 text-textDim">Selecciona un atleta...</span>
            </>
          )}
          <ChevronDown className="size-3.5 shrink-0 text-textDim" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-textDim" />
          <input
            autoFocus
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar atleta..."
            className="flex h-9 w-full rounded-md border border-input bg-transparent pl-8 pr-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="mt-2 max-h-72 space-y-0.5 overflow-y-auto">
          {filtrados.length === 0 ? (
            <p className="px-2 py-3 text-center text-sm text-textDim">Sin resultados.</p>
          ) : (
            filtrados.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  onSeleccionar(a.id);
                  setOpen(false);
                  setBusqueda("");
                }}
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-bg"
              >
                <AtletaAvatar atleta={a} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-textStrong">{a.nombre}</span>
                  <span className="block truncate text-xs text-textDim">{a.deporte}</span>
                </span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Modo atleta de /programacion: elegido un atleta, monta el módulo COMPLETO
 * de programación — el mismo `TabProgramacion` que usa la ficha (ProgramacionView
 * + aplicar plantilla + nueva sesión), no una copia. Editar aquí es editar en
 * la ficha y viceversa (mismo store).
 */
export function ModoAtleta() {
  const atletas = useAtletas();
  const [atletaId, setAtletaId] = useState<string | null>(null);

  const atletasOrdenados = useMemo(() => [...atletas].sort((a, b) => a.nombre.localeCompare(b.nombre)), [atletas]);
  const seleccionado = atletas.find((a) => a.id === atletaId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full max-w-sm">
          <SelectorAtletaUnico atletas={atletasOrdenados} seleccionado={seleccionado} onSeleccionar={setAtletaId} />
        </div>
        {seleccionado && (
          <Link
            href={`/atletas/${seleccionado.id}`}
            className="flex items-center gap-1 text-sm font-medium text-brand-ink hover:underline"
          >
            Ver ficha completa
            <ArrowRight className="size-3.5" />
          </Link>
        )}
      </div>

      {!seleccionado ? (
        <EmptyState
          icon={UserRound}
          title="Elige un atleta"
          description="Selecciona un atleta para ver y editar su programación completa: bloques, sesiones y sub-bloques de ejercicios."
        />
      ) : (
        <TabProgramacion atletaId={seleccionado.id} />
      )}
    </div>
  );
}
