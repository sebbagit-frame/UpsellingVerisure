import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { NOMBRE_COOKIE_SESION, verificarTokenSesion } from "@/lib/session";

const fuenteTitulos = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--fuente-titulos",
});

export const metadata: Metadata = {
  title: "Portal del Sector",
  description: "Sitio interno de consulta para operadores",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tokenSesion = cookies().get(NOMBRE_COOKIE_SESION)?.value;
  const rolSesion = tokenSesion
    ? await verificarTokenSesion(tokenSesion)
    : null;

  return (
    <html lang="es" className={fuenteTitulos.variable}>
      <body className="min-h-screen overflow-x-hidden bg-corporativo-fondo text-gray-900 antialiased">
        {rolSesion && <Navbar rolSesion={rolSesion} />}
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
