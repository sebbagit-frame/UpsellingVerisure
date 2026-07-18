import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { validarDatosDispositivo } from "@/lib/validaciones";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("dispositivos")
    .select(
      "id, nombre_dispositivo, nomenclatura, imagen_url, categoria, caracteristicas, descripcion, speech, sistema"
    )
    .order("nombre_dispositivo");

  if (error) {
    return NextResponse.json(
      { error: "No se pudieron listar los dispositivos" },
      { status: 500 }
    );
  }
  return NextResponse.json({ dispositivos: data });
}

export async function POST(solicitud: NextRequest) {
  let cuerpo: unknown;
  try {
    cuerpo = await solicitud.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const resultado = validarDatosDispositivo(cuerpo);
  if ("error" in resultado) {
    return NextResponse.json({ error: resultado.error }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("dispositivos")
    .insert(resultado.datos)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "No se pudo crear el dispositivo" },
      { status: 500 }
    );
  }
  return NextResponse.json({ dispositivo: data }, { status: 201 });
}
