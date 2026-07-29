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

  // Las rutas de API de administración responden en JSON, sin redirecciones
  if (pathname.startsWith("/api/admin")) {
    if (rolSesion !== "admin") {
      return NextResponse.json(
        { error: "Se requiere sesión de administrador" },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  if (!rolSesion) {
    return NextResponse.redirect(new URL("/login", solicitud.url));
  }

  // Las páginas de administración exigen rol admin; una sesión de sector
  // válida vuelve al inicio en lugar del login
  if (pathname.startsWith("/admin") && rolSesion !== "admin") {
    return NextResponse.redirect(new URL("/", solicitud.url));
  }

  return NextResponse.next();
}

export const config = {
  // Excluye archivos estáticos e internos de Next.js y los assets públicos
  // de /images (logos e ilustraciones, necesarios también en /login)
  matcher: ["/((?!_next/static|_next/image|images/|favicon.ico).*)"],
};
