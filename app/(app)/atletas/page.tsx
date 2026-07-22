"use client";

import { useMemo, useState } from "react";
import { Search, UserX } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { AtletaCard } from "@/components/atletas/atleta-card";
import { NuevoAtletaDialog } from "@/components/atletas/nuevo-atleta-dialog";
import { useAtletas } from "@/lib/store";

export default function AtletasPage() {
  const atletas = useAtletas();
  const [busqueda, setBusqueda] = useState("");

  const atletasFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return atletas;
    return atletas.filter((a) => a.nombre.toLowerCase().includes(q));
  }, [busqueda, atletas]);

  return (
    <>
      <PageHeader
        title="Atletas"
        description="Seguimiento y análisis de readaptación deportiva."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar atleta por nombre..."
            className="pl-9"
          />
        </div>
        <NuevoAtletaDialog />
      </div>

      {atletasFiltrados.length === 0 ? (
        <EmptyState
          icon={UserX}
          title="Sin resultados"
          description={`No hay ningún atleta que coincida con "${busqueda}".`}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {atletasFiltrados.map((atleta) => (
            <AtletaCard key={atleta.id} atleta={atleta} />
          ))}
        </div>
      )}
    </>
  );
}
