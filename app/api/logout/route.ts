import { NextResponse } from "next/server";
import { NOMBRE_COOKIE_SESION } from "@/lib/session";

export async function POST() {
  const respuesta = NextResponse.json({ ok: true });
  respuesta.cookies.set(NOMBRE_COOKIE_SESION, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return respuesta;
}
