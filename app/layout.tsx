import type { Metadata, Viewport } from "next";
import { Archivo, Inter } from "next/font/google";
import { ToastProvider } from "@/components/shared/toast";
import { ThemeEffect } from "@/components/theme/theme-effect";
import { StoreProvider } from "@/lib/store";
import { colors } from "@/lib/tokens";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fisiofles · Demo",
  description:
    "Demo clicable de Fisiofles: seguimiento y análisis para readaptación deportiva. Datos ficticios.",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Fisiofles",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: colors.bg,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${archivo.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        {/* Contrato de dirección (rediseño 2026-07) — emitido como comentario
            HTML real para que sobreviva al build de producción (los
            comentarios JSX se eliminan al compilar). */}
        <div
          hidden
          aria-hidden="true"
          dangerouslySetInnerHTML={{
            __html: `<!--
THESIS: instrumento clinico-deportivo premium; rechaza la plantilla SaaS de cards blancas planas con acento timido.
OWN-WORLD: dos temas gemelos - claro VALD (blanco quirurgico sobre gris frio, sombras reales) y oscuro Whoop (carbon azulado, cifras rotundas); rail de navegacion carbon constante con cyan #1DC4EB; Archivo para datos, Inter para UI; semaforo rojo-verde intacto.
STORY: el fisio escanea variables de sus atletas y decide; la app muestra con jerarquia inapelable, nunca recomienda.
FIRST VIEWPORT: rail carbon izquierda; contenido con ficha de atleta: identidad + fase + metricas en numerales tabulares, tabs visibles sin scroll en 1366x768.
FORM: estandar del sector jugado limpio (canon elegido por el usuario; liston VALD Hub/Whoop). Seed bab0d07a.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md.
-->`,
          }}
        />
        <StoreProvider>
          <ThemeEffect />
          <ToastProvider>{children}</ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
