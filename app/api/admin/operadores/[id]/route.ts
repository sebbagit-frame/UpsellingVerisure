import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { validarDatosOperador } from "@/lib/validaciones";
import { eliminarFotoDeStorage } from "@/lib/storageOperadores";

function obtenerIdValido(id: string): number | null {
  const idNumerico = Number(id);
  return Number.isInteger(idNumerico) && idNumerico > 0 ? idNumerico : null;
}

export async function PUT(
  solicitud: NextRequest,
  { params }: { params: { id: string } }
) {
  const idOperador = obtenerIdValido(params.id);
  if (!idOperador) {
    return NextResponse.json(
      { error: "Identificador de operador inválido" },
      { status: 400 }
    );
  }

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

  // Estado previo para limpiar la foto anterior si fue reemplazada
  const { data: operadorPrevio } = await supabaseAdmin
    .from("operadores")
    .select("foto_url")
    .eq("id", idOperador)
    .maybeSingle();

  const { data, error } = await supabaseAdmin
    .from("operadores")
    .update(resultado.datos)
    .eq("id", idOperador)
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "No se pudo editar el operador" },
      { status: 500 }
    );
  }
  if (!data) {
    return NextResponse.json(
      { error: "El operador no existe" },
      { status: 404 }
    );
  }

  if (
    operadorPrevio?.foto_url &&
    operadorPrevio.foto_url !== resultado.datos.foto_url
  ) {
    await eliminarFotoDeStorage(operadorPrevio.foto_url);
  }

  return NextResponse.json({ operador: data });
}

export async function DELETE(
  _solicitud: NextRequest,
  { params }: { params: { id: string } }
) {
  const idOperador = obtenerIdValido(params.id);
  if (!idOperador) {
    return NextResponse.json(
      { error: "Identificador de operador inválido" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("operadores")
    .delete()
    .eq("id", idOperador)
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "No se pudo eliminar el operador" },
      { status: 500 }
    );
  }
  if (!data) {
    return NextResponse.json(
      { error: "El operador no existe" },
      { status: 404 }
    );
  }

  if (data.foto_url) {
    await eliminarFotoDeStorage(data.foto_url);
  }

  return NextResponse.json({ ok: true });
}
