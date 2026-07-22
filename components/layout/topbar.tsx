"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Bell, FlaskConical, Menu, RotateCcw } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { navItemFooter, navItems, Wordmark } from "@/components/layout/sidebar";
import { useToast } from "@/components/shared/toast";
import { resetDemo, useDispatch, useNotificacionesNoLeidas } from "@/lib/store";
import { cn } from "@/lib/utils";

function isActive(pathname: string | null, href: string) {
  if (href === "/") return pathname === "/";
  return pathname?.startsWith(href) ?? false;
}

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const toast = useToast();
  const noLeidas = useNotificacionesNoLeidas();

  function handleReset() {
    resetDemo(dispatch);
    toast("Demo restablecida", "Todos los datos se han vuelto a sembrar desde cero.");
  }

  function handleReiniciarDemo() {
    resetDemo(dispatch);
    toast("Demo reiniciada", "Todos los datos se han vuelto a sembrar desde cero.");
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="size-5" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex w-64 flex-col p-0">
          <div className="flex h-16 items-center px-6">
            <Wordmark />
          </div>
          <nav className="flex flex-1 flex-col gap-1 p-4">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;
              const showBadge = item.href === "/notificaciones" && noLeidas.length > 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
            })}
          </nav>
          <div className="border-t border-border p-4">
            <Link
              href={navItemFooter.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive(pathname, navItemFooter.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <navItemFooter.icon className="size-4" />
              {navItemFooter.label}
            </Link>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex-1" />

      <div className="flex items-center gap-1 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground">
        <FlaskConical className="size-3.5" />
        <span>
          Demo <span className="text-border">·</span> datos ficticios
        </span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => router.push("/notificaciones")}
      >
        <Bell className="size-5" />
        {noLeidas.length > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">
            {noLeidas.length}
          </span>
        )}
        <span className="sr-only">Notificaciones</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-2">
            <Avatar className="size-8">
              <AvatarFallback className="bg-brand-tint text-brand-ink">
                AR
              </AvatarFallback>
            </Avatar>
            <span className="hidden flex-col items-start leading-tight sm:flex">
              <span className="text-sm font-medium text-foreground">
                Dr. Álex Ríos
              </span>
              <span className="text-xs text-muted-foreground">
                Readaptación
              </span>
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Sesión demo</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleReset}>
            <RotateCcw className="mr-2 size-4" />
            Restablecer demo
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleReiniciarDemo}>
            <RotateCcw className="mr-2 size-4" />
            Reiniciar demo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
