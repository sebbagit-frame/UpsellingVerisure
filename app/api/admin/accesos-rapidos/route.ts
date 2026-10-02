import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { validarDatosAccesoRapido } from "@/lib/validaciones";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("accesos_rapidos")
    .select("id, titulo, url")
    .order("id");

  if (error) {
    return NextResponse.json(
      { error: "No se pudieron listar los accesos rápidos" },
      { status: 500 }
    );
  }
  return NextResponse.json({ accesosRapidos: data });
}

export async function POST(solicitud: NextRequest) {
  let cuerpo: unknown;
  try {
    cuerpo = await solicitud.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const resultado = validarDatosAccesoRapido(cuerpo);
  if ("error" in resultado) {
    return NextResponse.json({ error: resultado.error }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("accesos_rapidos")
    .insert(resultado.datos)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "No se pudo crear el acceso rápido" },
      { status: 500 }
    );
  }
  return NextResponse.json({ accesoRapido: data }, { status: 201 });
}
