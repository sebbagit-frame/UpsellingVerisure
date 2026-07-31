import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { validarDatosAviso } from "@/lib/validaciones";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("avisos")
    .select("id, titulo, mensaje")
    .order("id");

  if (error) {
    return NextResponse.json(
      { error: "No se pudieron listar los avisos" },
      { status: 500 }
    );
  }
  return NextResponse.json({ avisos: data });
}

export async function POST(solicitud: NextRequest) {
  let cuerpo: unknown;
  try {
    cuerpo = await solicitud.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const resultado = validarDatosAviso(cuerpo);
  if ("error" in resultado) {
    return NextResponse.json({ error: resultado.error }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("avisos")
    .insert(resultado.datos)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "No se pudo crear el aviso" },
      { status: 500 }
    );
  }
  return NextResponse.json({ aviso: data }, { status: 201 });
}
