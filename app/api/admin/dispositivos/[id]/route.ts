import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { validarDatosDispositivo } from "@/lib/validaciones";
import { eliminarImagenDeStorage } from "@/lib/storageDispositivos";

function obtenerIdValido(id: string): number | null {
  const idNumerico = Number(id);
  return Number.isInteger(idNumerico) && idNumerico > 0 ? idNumerico : null;
}

export async function PUT(
  solicitud: NextRequest,
  { params }: { params: { id: string } }
) {
  const idDispositivo = obtenerIdValido(params.id);
  if (!idDispositivo) {
    return NextResponse.json(
      { error: "Identificador de dispositivo inválido" },
      { status: 400 }
    );
  }

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

  // Estado previo para limpiar la imagen anterior si fue reemplazada
  const { data: dispositivoPrevio } = await supabaseAdmin
    .from("dispositivos")
    .select("imagen_url")
    .eq("id", idDispositivo)
    .maybeSingle();

  const { data, error } = await supabaseAdmin
    .from("dispositivos")
    .update(resultado.datos)
    .eq("id", idDispositivo)
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "No se pudo editar el dispositivo" },
      { status: 500 }
    );
  }
  if (!data) {
    return NextResponse.json(
      { error: "El dispositivo no existe" },
      { status: 404 }
    );
  }

  if (
    dispositivoPrevio?.imagen_url &&
    dispositivoPrevio.imagen_url !== resultado.datos.imagen_url
  ) {
    await eliminarImagenDeStorage(dispositivoPrevio.imagen_url);
  }

  return NextResponse.json({ dispositivo: data });
}

export async function DELETE(
  _solicitud: NextRequest,
  { params }: { params: { id: string } }
) {
  const idDispositivo = obtenerIdValido(params.id);
  if (!idDispositivo) {
    return NextResponse.json(
      { error: "Identificador de dispositivo inválido" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("dispositivos")
    .delete()
    .eq("id", idDispositivo)
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "No se pudo eliminar el dispositivo" },
      { status: 500 }
    );
  }
  if (!data) {
    return NextResponse.json(
      { error: "El dispositivo no existe" },
      { status: 404 }
    );
  }

  if (data.imagen_url) {
    await eliminarImagenDeStorage(data.imagen_url);
  }

  return NextResponse.json({ ok: true });
}
