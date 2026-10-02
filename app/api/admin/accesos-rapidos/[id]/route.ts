import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { validarDatosAccesoRapido } from "@/lib/validaciones";

function obtenerIdValido(id: string): number | null {
  const idNumerico = Number(id);
  return Number.isInteger(idNumerico) && idNumerico > 0 ? idNumerico : null;
}

export async function PUT(
  solicitud: NextRequest,
  { params }: { params: { id: string } }
) {
  const idAcceso = obtenerIdValido(params.id);
  if (!idAcceso) {
    return NextResponse.json(
      { error: "Identificador de acceso rápido inválido" },
      { status: 400 }
    );
  }

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
    .update(resultado.datos)
    .eq("id", idAcceso)
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "No se pudo editar el acceso rápido" },
      { status: 500 }
    );
  }
  if (!data) {
    return NextResponse.json(
      { error: "El acceso rápido no existe" },
      { status: 404 }
    );
  }
  return NextResponse.json({ accesoRapido: data });
}

export async function DELETE(
  _solicitud: NextRequest,
  { params }: { params: { id: string } }
) {
  const idAcceso = obtenerIdValido(params.id);
  if (!idAcceso) {
    return NextResponse.json(
      { error: "Identificador de acceso rápido inválido" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("accesos_rapidos")
    .delete()
    .eq("id", idAcceso)
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "No se pudo eliminar el acceso rápido" },
      { status: 500 }
    );
  }
  if (!data) {
    return NextResponse.json(
      { error: "El acceso rápido no existe" },
      { status: 404 }
    );
  }
  return NextResponse.json({ ok: true });
}
