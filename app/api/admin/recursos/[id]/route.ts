import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { validarDatosRecurso } from "@/lib/validaciones";
import { eliminarArchivoDeStorage } from "@/lib/storageRecursos";

function obtenerIdValido(id: string): number | null {
  const idNumerico = Number(id);
  return Number.isInteger(idNumerico) && idNumerico > 0 ? idNumerico : null;
}

export async function PUT(
  solicitud: NextRequest,
  { params }: { params: { id: string } }
) {
  const idRecurso = obtenerIdValido(params.id);
  if (!idRecurso) {
    return NextResponse.json(
      { error: "Identificador de recurso inválido" },
      { status: 400 }
    );
  }

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

  // Estado previo para limpiar el archivo anterior si fue reemplazado
  const { data: recursoPrevio } = await supabaseAdmin
    .from("recursos")
    .select("archivo_url")
    .eq("id", idRecurso)
    .maybeSingle();

  const { data, error } = await supabaseAdmin
    .from("recursos")
    .update(resultado.datos)
    .eq("id", idRecurso)
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "No se pudo editar el recurso" },
      { status: 500 }
    );
  }
  if (!data) {
    return NextResponse.json(
      { error: "El recurso no existe" },
      { status: 404 }
    );
  }

  if (
    recursoPrevio?.archivo_url &&
    recursoPrevio.archivo_url !== resultado.datos.archivo_url
  ) {
    await eliminarArchivoDeStorage(recursoPrevio.archivo_url);
  }

  return NextResponse.json({ recurso: data });
}

export async function DELETE(
  _solicitud: NextRequest,
  { params }: { params: { id: string } }
) {
  const idRecurso = obtenerIdValido(params.id);
  if (!idRecurso) {
    return NextResponse.json(
      { error: "Identificador de recurso inválido" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("recursos")
    .delete()
    .eq("id", idRecurso)
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "No se pudo eliminar el recurso" },
      { status: 500 }
    );
  }
  if (!data) {
    return NextResponse.json(
      { error: "El recurso no existe" },
      { status: 404 }
    );
  }

  if (data.archivo_url) {
    await eliminarArchivoDeStorage(data.archivo_url);
  }

  return NextResponse.json({ ok: true });
}
