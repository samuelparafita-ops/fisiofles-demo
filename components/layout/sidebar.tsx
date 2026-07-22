"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
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
  { href: "/ejercicios", label: "Ejercicios", icon: Dumbbell },
  { href: "/plantillas", label: "Plantillas", icon: LayoutTemplate },
  { href: "/formularios", label: "Formularios", icon: ClipboardList },
  { href: "/notificaciones", label: "Notificaciones", icon: Bell },
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
        "flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "border-brand bg-brand-tint text-brand-ink"
          : "border-transparent text-muted-foreground hover:bg-borderSoft hover:text-foreground"
      )}
    >
      <Icon className="size-4" />
      <span className="flex-1">{item.label}</span>
      {showBadge && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-xs font-semibold text-white">
          {noLeidas.length}
        </span>
      )}
    </Link>
  );
}

export function Wordmark() {
  return (
    <span className="font-display text-lg font-bold tracking-tight text-textStrong">
      Fisiofles<span className="text-brand">.</span>
    </span>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border md:bg-surface1">
      <div className="flex h-16 items-center px-6">
        <Wordmark />
      </div>
      <nav className="flex flex-1 flex-col space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </nav>
      <div className="border-t border-border px-3 py-3">
        <NavLink item={navItemFooter} active={isActive(pathname, navItemFooter.href)} />
      </div>
    </aside>
  );
}
