import { NextRequest, NextResponse } from "next/server";
import { crearTokenSesion, NOMBRE_COOKIE_SESION } from "@/lib/session";

const DURACION_COOKIE_SEGUNDOS = 60 * 60 * 24 * 30; // 30 días

export async function POST(solicitud: NextRequest) {
  const contrasenaSitio = process.env.SITE_PASSWORD;
  if (!contrasenaSitio) {
    return NextResponse.json(
      { error: "El servidor no tiene configurada la contraseña del sitio" },
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

  if (
    typeof contrasenaIngresada !== "string" ||
    contrasenaIngresada !== contrasenaSitio
  ) {
    return NextResponse.json(
      { error: "Contraseña incorrecta" },
      { status: 401 }
    );
  }

  const tokenSesion = await crearTokenSesion();
  const respuesta = NextResponse.json({ ok: true });
  respuesta.cookies.set(NOMBRE_COOKIE_SESION, tokenSesion, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_COOKIE_SEGUNDOS,
  });
  return respuesta;
}
