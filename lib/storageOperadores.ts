import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const BUCKET_OPERADORES = "operadores";

/**
 * Crea el bucket de fotos de operadores si todavía no existe, con lectura
 * pública. A diferencia de los buckets de dispositivos y recursos (creados
 * a mano desde el dashboard de Supabase), este se asegura en código porque
 * es el primero que se necesita antes de haber hecho ese paso manual.
 */
export async function asegurarBucketOperadores(): Promise<void> {
  const { data: bucket } = await supabaseAdmin.storage.getBucket(
    BUCKET_OPERADORES
  );
  if (bucket) {
    return;
  }
  await supabaseAdmin.storage.createBucket(BUCKET_OPERADORES, {
    public: true,
  });
}

/**
 * Extrae la ruta interna del archivo dentro del bucket a partir de su URL pública.
 * Devuelve null si la URL no pertenece al bucket de operadores.
 */
export function obtenerRutaDeUrlPublicaOperadores(
  urlPublica: string
): string | null {
  const marcador = `/storage/v1/object/public/${BUCKET_OPERADORES}/`;
  const indice = urlPublica.indexOf(marcador);
  if (indice === -1) {
    return null;
  }
  const ruta = urlPublica.slice(indice + marcador.length);
  return ruta ? decodeURIComponent(ruta) : null;
}

/**
 * Elimina del bucket la foto referenciada por una URL pública.
 * No lanza si la URL es externa al bucket o el borrado falla: el registro
 * en la base es lo prioritario y un archivo huérfano no rompe nada.
 */
export async function eliminarFotoDeStorage(
  urlPublica: string
): Promise<void> {
  const ruta = obtenerRutaDeUrlPublicaOperadores(urlPublica);
  if (!ruta) {
    return;
  }
  await supabaseAdmin.storage.from(BUCKET_OPERADORES).remove([ruta]);
}
