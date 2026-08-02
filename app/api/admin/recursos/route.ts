import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { validarDatosRecurso } from "@/lib/validaciones";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("recursos")
    .select(
      "id, titulo, tipo, categoria, archivo_url, enlace_externo, dispositivo_id, fecha_subida, dispositivos(nombre_dispositivo)"
    )
    .order("fecha_subida", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "No se pudieron listar los recursos" },
      { status: 500 }
    );
  }
  return NextResponse.json({ recursos: data });
}

export async function POST(solicitud: NextRequest) {
  let cuerpo: unknown;
  try {
    cuerpo = await solicitud.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const resultado = validarDatosRecurso(cuerpo);
  if ("error" in resultado) {
    return NextResponse.json({ error: resultado.error }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("recursos")
    .insert(resultado.datos)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "No se pudo crear el recurso" },
      { status: 500 }
    );
  }
  return NextResponse.json({ recurso: data }, { status: 201 });
}
