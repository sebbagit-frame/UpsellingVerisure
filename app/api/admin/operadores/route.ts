import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { validarDatosOperador } from "@/lib/validaciones";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("operadores")
    .select("id, nombre_operador, matricula, interno")
    .order("nombre_operador");

  if (error) {
    return NextResponse.json(
      { error: "No se pudieron listar los operadores" },
      { status: 500 }
    );
  }
  return NextResponse.json({ operadores: data });
}

export async function POST(solicitud: NextRequest) {
  let cuerpo: unknown;
  try {
    cuerpo = await solicitud.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const resultado = validarDatosOperador(cuerpo);
  if ("error" in resultado) {
    return NextResponse.json({ error: resultado.error }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("operadores")
    .insert(resultado.datos)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "No se pudo crear el operador" },
      { status: 500 }
    );
  }
  return NextResponse.json({ operador: data }, { status: 201 });
}
