"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Briefcase,
  CalendarRange,
  ChartNoAxesCombined,
  ClipboardList,
  Dumbbell,
  House,
  LayoutTemplate,
  Settings2,
  Users,
} from "lucide-react";
import { useNotificacionesNoLeidas } from "@/lib/store";
import { cn } from "@/lib/utils";

export const navItems = [
  { href: "/", label: "Inicio", icon: House },
  { href: "/dashboard", label: "Dashboard", icon: ChartNoAxesCombined },
  { href: "/atletas", label: "Atletas", icon: Users },
  { href: "/programacion", label: "Programación", icon: CalendarRange },
  { href: "/ejercicios", label: "Ejercicios", icon: Dumbbell },
  { href: "/plantillas", label: "Plantillas", icon: LayoutTemplate },
  { href: "/formularios", label: "Formularios", icon: ClipboardList },
  { href: "/notificaciones", label: "Notificaciones", icon: Bell },
  { href: "/clinica", label: "Clínica", icon: Briefcase },
];

export const navItemFooter = {
  href: "/personalizacion",
  label: "Personalización",
  icon: Settings2,
};

function isActive(pathname: string | null, href: string) {
  if (href === "/") return pathname === "/";
  return pathname?.startsWith(href) ?? false;
}

/**
 * Item del rail carbón. El activo se marca con un lavado del acento sobre
 * el carbón (`--brand` con alfa, válido para cualquier acento de
 * Personalización) + texto/icono en el acento; el resto en gris del rail.
 */
function NavLink({
  item,
  active,
}: {
  item: { href: string; label: string; icon: typeof House };
  active: boolean;
}) {
  const Icon = item.icon;
  const noLeidas = useNotificacionesNoLeidas();
  const showBadge = item.href === "/notificaciones" && noLeidas.length > 0;

  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-[hsl(var(--brand)/0.13)] text-[hsl(var(--brand))]"
          : "text-rail-muted hover:bg-rail-hover hover:text-rail-text"
      )}
    >
      <Icon
        className={cn(
          "size-4 transition-colors",
          active ? "text-[hsl(var(--brand))]" : "text-rail-muted group-hover:text-rail-text"
        )}
      />
      <span className="flex-1">{item.label}</span>
      {showBadge && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[hsl(var(--brand))] px-1 text-xs font-semibold text-rail">
          {noLeidas.length}
        </span>
      )}
    </Link>
  );
}

/** Wordmark — sobre rail carbón por defecto; `onLight` para el sheet móvil. */
export function Wordmark({ onLight = false }: { onLight?: boolean }) {
  return (
    <span
      className={cn(
        "font-display text-lg font-bold tracking-tight",
        onLight ? "text-textStrong" : "text-rail-text"
      )}
    >
      Fisiofles<span className="text-[hsl(var(--brand))]">.</span>
    </span>
  );
}

/**
 * Rail de navegación — carbón constante en ambos temas (firma del rediseño
 * 2026-07): la marca vive aquí; el contenido cambia de tema, el rail no.
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden bg-rail md:flex md:w-60 md:flex-col md:border-r md:border-rail-border">
      <div className="flex h-16 items-center px-6">
        <Wordmark />
      </div>
      <nav className="flex flex-1 flex-col space-y-0.5 px-3 py-4">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </nav>
      <div className="border-t border-rail-border px-3 py-3">
        <NavLink item={navItemFooter} active={isActive(pathname, navItemFooter.href)} />
      </div>
    </aside>
  );
}
