import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { validarDatosSector } from "@/lib/validaciones";

function obtenerIdValido(id: string): number | null {
  const idNumerico = Number(id);
  return Number.isInteger(idNumerico) && idNumerico > 0 ? idNumerico : null;
}

export async function PUT(
  solicitud: NextRequest,
  { params }: { params: { id: string } }
) {
  const idSector = obtenerIdValido(params.id);
  if (!idSector) {
    return NextResponse.json(
      { error: "Identificador de sector inválido" },
      { status: 400 }
    );
  }

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
    .update(resultado.datos)
    .eq("id", idSector)
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "No se pudo editar el sector" },
      { status: 500 }
    );
  }
  if (!data) {
    return NextResponse.json(
      { error: "El sector no existe" },
      { status: 404 }
    );
  }
  return NextResponse.json({ sector: data });
}

export async function DELETE(
  _solicitud: NextRequest,
  { params }: { params: { id: string } }
) {
  const idSector = obtenerIdValido(params.id);
  if (!idSector) {
    return NextResponse.json(
      { error: "Identificador de sector inválido" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("sectores")
    .delete()
    .eq("id", idSector)
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "No se pudo eliminar el sector" },
      { status: 500 }
    );
  }
  if (!data) {
    return NextResponse.json(
      { error: "El sector no existe" },
      { status: 404 }
    );
  }
  return NextResponse.json({ ok: true });
}
