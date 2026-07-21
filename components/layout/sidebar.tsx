"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Dumbbell, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export const navItems = [
  { href: "/atletas", label: "Atletas", icon: Users },
  { href: "/ejercicios", label: "Ejercicios", icon: Dumbbell },
  { href: "/formularios", label: "Formularios", icon: ClipboardList },
];

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
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const active = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-brand bg-brand-tint text-brand-ink"
                  : "border-transparent text-muted-foreground hover:bg-borderSoft hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
