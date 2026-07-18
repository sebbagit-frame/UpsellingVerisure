import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { NOMBRE_COOKIE_SESION, verificarTokenSesion } from "@/lib/session";

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
    <html lang="es">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <Navbar rolSesion={rolSesion} />
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
