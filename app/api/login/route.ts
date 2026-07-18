import { NextRequest, NextResponse } from "next/server";
import { crearTokenSesion, NOMBRE_COOKIE_SESION, RolSesion } from "@/lib/session";

const DURACION_COOKIE_SEGUNDOS = 60 * 60 * 24 * 30; // 30 días

function determinarRol(contrasenaIngresada: string): RolSesion | null {
  if (
    process.env.ADMIN_PASSWORD &&
    contrasenaIngresada === process.env.ADMIN_PASSWORD
  ) {
    return "admin";
  }
  if (
    process.env.SITE_PASSWORD &&
    contrasenaIngresada === process.env.SITE_PASSWORD
  ) {
    return "sector";
  }
  return null;
}

export async function POST(solicitud: NextRequest) {
  if (!process.env.SITE_PASSWORD || !process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "El servidor no tiene configuradas las contraseñas del sitio" },
      { status: 500 }
    );
  }

  let contrasenaIngresada: unknown;
  try {
    const cuerpo = await solicitud.json();
    contrasenaIngresada = cuerpo?.contrasena;
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const rol =
    typeof contrasenaIngresada === "string"
      ? determinarRol(contrasenaIngresada)
      : null;

  if (!rol) {
    return NextResponse.json(
      { error: "Contraseña incorrecta" },
      { status: 401 }
    );
  }

  const tokenSesion = await crearTokenSesion(rol);
  const respuesta = NextResponse.json({ ok: true, rol });
  respuesta.cookies.set(NOMBRE_COOKIE_SESION, tokenSesion, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_COOKIE_SEGUNDOS,
  });
  return respuesta;
}
