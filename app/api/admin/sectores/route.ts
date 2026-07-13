import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { validarDatosSector } from "@/lib/validaciones";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("sectores")
    .select("id, sector, interno")
    .order("sector");

  if (error) {
    return NextResponse.json(
      { error: "No se pudieron listar los sectores" },
      { status: 500 }
    );
  }
  return NextResponse.json({ sectores: data });
}

export async function POST(solicitud: NextRequest) {
  let cuerpo: unknown;
  try {
    cuerpo = await solicitud.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const resultado = validarDatosSector(cuerpo);
  if ("error" in resultado) {
    return NextResponse.json({ error: resultado.error }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("sectores")
    .insert(resultado.datos)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "No se pudo crear el sector" },
      { status: 500 }
    );
  }
  return NextResponse.json({ sector: data }, { status: 201 });
}
