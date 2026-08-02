import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const BUCKET_RECURSOS = "recursos";

/**
 * Extrae la ruta interna del archivo dentro del bucket a partir de su URL pública.
 * Devuelve null si la URL no pertenece al bucket de recursos.
 */
export function obtenerRutaDeUrlPublicaRecursos(
  urlPublica: string
): string | null {
  const marcador = `/storage/v1/object/public/${BUCKET_RECURSOS}/`;
  const indice = urlPublica.indexOf(marcador);
  if (indice === -1) {
    return null;
  }
  const ruta = urlPublica.slice(indice + marcador.length);
  return ruta ? decodeURIComponent(ruta) : null;
}

/**
 * Elimina del bucket el archivo referenciado por una URL pública.
 * No lanza si la URL es externa al bucket o el borrado falla: el registro
 * en la base es lo prioritario y un archivo huérfano no rompe nada.
 */
export async function eliminarArchivoDeStorage(
  urlPublica: string
): Promise<void> {
  const ruta = obtenerRutaDeUrlPublicaRecursos(urlPublica);
  if (!ruta) {
    return;
  }
  await supabaseAdmin.storage.from(BUCKET_RECURSOS).remove([ruta]);
}
