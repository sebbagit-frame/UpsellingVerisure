import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { BUCKET_RECURSOS } from "@/lib/storageRecursos";

const TAMANO_MAXIMO_BYTES = 20 * 1024 * 1024; // 20 MB

/** Extensiones admitidas para cada tipo de recurso con archivo. */
const EXTENSIONES_POR_TIPO: Record<string, string[]> = {
  pdf: [".pdf"],
  excel: [".xls", ".xlsx", ".csv"],
  word: [".doc", ".docx"],
};

/**
 * Genera un nombre de archivo único: timestamp + nombre original saneado.
 */
function generarNombreArchivo(nombreOriginal: string): string {
  const saneado = nombreOriginal
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `${Date.now()}-${saneado || "recurso"}`;
}

export async function POST(solicitud: NextRequest) {
  let formulario: FormData;
  try {
    formulario = await solicitud.formData();
  } catch {
    return NextResponse.json(
      { error: "Se esperaba un formulario con el archivo" },
      { status: 400 }
    );
  }

  const archivo = formulario.get("archivo");
  const tipo = formulario.get("tipo");

  if (!(archivo instanceof File) || archivo.size === 0) {
    return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });
  }
  if (typeof tipo !== "string" || !(tipo in EXTENSIONES_POR_TIPO)) {
    return NextResponse.json(
      { error: "El tipo debe ser pdf, excel o word para subir un archivo" },
      { status: 400 }
    );
  }

  const extensionesValidas = EXTENSIONES_POR_TIPO[tipo];
  const nombreMinusculas = archivo.name.toLowerCase();
  if (!extensionesValidas.some((ext) => nombreMinusculas.endsWith(ext))) {
    return NextResponse.json(
      {
        error: `El archivo debe tener extensión ${extensionesValidas.join(", ")} para el tipo ${tipo}`,
      },
      { status: 400 }
    );
  }
  if (archivo.size > TAMANO_MAXIMO_BYTES) {
    return NextResponse.json(
      { error: "El archivo no puede superar los 20 MB" },
      { status: 400 }
    );
  }

  const nombreArchivo = generarNombreArchivo(archivo.name);
  const { error } = await supabaseAdmin.storage
    .from(BUCKET_RECURSOS)
    .upload(nombreArchivo, archivo, { contentType: archivo.type });

  if (error) {
    return NextResponse.json(
      { error: "No se pudo subir el archivo" },
      { status: 500 }
    );
  }

  const { data } = supabaseAdmin.storage
    .from(BUCKET_RECURSOS)
    .getPublicUrl(nombreArchivo);

  return NextResponse.json({ url: data.publicUrl }, { status: 201 });
}
