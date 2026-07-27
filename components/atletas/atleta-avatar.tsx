"use client";

import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Atleta } from "@/lib/store";

const CIRCLE_SIZE: Record<"sm" | "md" | "lg", string> = {
  sm: "size-9",
  md: "size-11",
  lg: "size-16",
};

const ICON_SIZE: Record<"sm" | "md" | "lg", string> = {
  sm: "size-4",
  md: "size-5",
  lg: "size-7",
};

/**
 * Avatar de atleta compartido por card, tabla y ficha-header — mismo patrón
 * en los tres sitios (CLAUDE.md > única fuente de verdad no aplica aquí,
 * pero sí la consistencia visual pedida en FASE 6). `fotoUrl` es siempre
 * `undefined` en la semilla: se pinta un icono placeholder sobre fondo
 * brand-tint; si existiera foto, se pinta la imagen.
 */
export function AtletaAvatar({
  atleta,
  size = "md",
  className,
}: {
  atleta: Pick<Atleta, "nombre" | "fotoUrl">;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  if (atleta.fotoUrl) {
    return (
      <img
        src={atleta.fotoUrl}
        alt={atleta.nombre}
        className={cn(CIRCLE_SIZE[size], "shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        CIRCLE_SIZE[size],
        "flex shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand-ink",
        className
      )}
    >
      <UserRound className={ICON_SIZE[size]} />
    </div>
  );
}
