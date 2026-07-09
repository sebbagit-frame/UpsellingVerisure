import { NextRequest, NextResponse } from "next/server";
import { NOMBRE_COOKIE_SESION, verificarTokenSesion } from "@/lib/session";

const RUTAS_PUBLICAS = ["/login", "/api/login"];

export async function middleware(solicitud: NextRequest) {
  const { pathname } = solicitud.nextUrl;

  if (RUTAS_PUBLICAS.includes(pathname)) {
    return NextResponse.next();
  }

  const tokenSesion = solicitud.cookies.get(NOMBRE_COOKIE_SESION)?.value;
  const sesionValida = tokenSesion
    ? await verificarTokenSesion(tokenSesion)
    : false;

  if (!sesionValida) {
    const urlLogin = new URL("/login", solicitud.url);
    return NextResponse.redirect(urlLogin);
  }

  return NextResponse.next();
}

export const config = {
  // Excluye archivos estáticos e internos de Next.js
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
