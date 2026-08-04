import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { asegurarBucketOperadores, BUCKET_OPERADORES } from "@/lib/storageOperadores";

const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Genera un nombre de archivo único: timestamp + nombre original saneado
 * (solo letras, números, guiones y punto de la extensión).
 */
function generarNombreArchivo(nombreOriginal: string): string {
  const saneado = nombreOriginal
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita tildes ya separadas por NFD
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `${Date.now()}-${saneado || "foto"}`;
}

export async function POST(solicitud: NextRequest) {
  let formulario: FormData;
  try {
    formulario = await solicitud.formData();
  } catch {
    return NextResponse.json(
      { error: "Se esperaba un formulario con el archivo de foto" },
      { status: 400 }
    );
  }

  const archivo = formulario.get("archivo");
  if (!(archivo instanceof File) || archivo.size === 0) {
    return NextResponse.json(
      { error: "Falta el archivo de foto" },
      { status: 400 }
    );
  }
  if (!archivo.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "El archivo debe ser una imagen" },
      { status: 400 }
    );
  }
  if (archivo.size > TAMANO_MAXIMO_BYTES) {
    return NextResponse.json(
      { error: "La imagen no puede superar los 5 MB" },
      { status: 400 }
    );
  }

  await asegurarBucketOperadores();

  const nombreArchivo = generarNombreArchivo(archivo.name);
  const { error } = await supabaseAdmin.storage
    .from(BUCKET_OPERADORES)
    .upload(nombreArchivo, archivo, { contentType: archivo.type });

  if (error) {
    return NextResponse.json(
      { error: "No se pudo subir la foto" },
      { status: 500 }
    );
  }

  const { data } = supabaseAdmin.storage
    .from(BUCKET_OPERADORES)
    .getPublicUrl(nombreArchivo);

  return NextResponse.json({ url: data.publicUrl }, { status: 201 });
}
