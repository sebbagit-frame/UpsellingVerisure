import { NextRequest, NextResponse } from "next/server";
import { NOMBRE_COOKIE_SESION, verificarTokenSesion } from "@/lib/session";

const RUTAS_PUBLICAS = ["/login", "/api/login"];

export async function middleware(solicitud: NextRequest) {
  const { pathname } = solicitud.nextUrl;

  if (RUTAS_PUBLICAS.includes(pathname)) {
    return NextResponse.next();
  }

  const tokenSesion = solicitud.cookies.get(NOMBRE_COOKIE_SESION)?.value;
  const rolSesion = tokenSesion
    ? await verificarTokenSesion(tokenSesion)
    : null;

  if (!rolSesion) {
    return NextResponse.redirect(new URL("/login", solicitud.url));
  }

  // Las rutas de administración exigen rol admin; una sesión de sector
  // válida vuelve al inicio en lugar del login
  if (pathname.startsWith("/admin") && rolSesion !== "admin") {
    return NextResponse.redirect(new URL("/", solicitud.url));
  }

  return NextResponse.next();
}

export const config = {
  // Excluye archivos estáticos e internos de Next.js
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
