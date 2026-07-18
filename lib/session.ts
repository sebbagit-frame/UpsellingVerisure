const DURACION_SESION_SEGUNDOS = 60 * 60 * 24 * 30; // 30 días

export const NOMBRE_COOKIE_SESION = "sesion_sector";

export type RolSesion = "sector" | "admin";

const ROLES_VALIDOS: RolSesion[] = ["sector", "admin"];

interface CargaSesion {
  rol: RolSesion;
  vencimiento: number; // timestamp Unix en segundos
}

function obtenerSecreto(): string {
  const secreto = process.env.SESSION_SECRET;
  if (!secreto) {
    throw new Error("Falta la variable de entorno SESSION_SECRET");
  }
  return secreto;
}

async function importarClaveHmac(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(obtenerSecreto()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function aBase64Url(datos: ArrayBuffer | Uint8Array): string {
  const bytes = datos instanceof Uint8Array ? datos : new Uint8Array(datos);
  let binario = "";
  for (let i = 0; i < bytes.length; i++) {
    binario += String.fromCharCode(bytes[i]);
  }
  return btoa(binario).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function desdeBase64Url(texto: string): Uint8Array<ArrayBuffer> {
  const base64 = texto.replace(/-/g, "+").replace(/_/g, "/");
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) {
    bytes[i] = binario.charCodeAt(i);
  }
  return bytes;
}

/**
 * Crea un token de sesión para el rol indicado, con vencimiento a 30 días,
 * firmado con HMAC-SHA256.
 * Formato: "<cargaJsonBase64Url>.<firmaBase64Url>"
 */
export async function crearTokenSesion(rol: RolSesion): Promise<string> {
  const carga: CargaSesion = {
    rol,
    vencimiento: Math.floor(Date.now() / 1000) + DURACION_SESION_SEGUNDOS,
  };
  const cargaCodificada = aBase64Url(
    new TextEncoder().encode(JSON.stringify(carga))
  );
  const clave = await importarClaveHmac();
  const firma = await crypto.subtle.sign(
    "HMAC",
    clave,
    new TextEncoder().encode(cargaCodificada)
  );
  return `${cargaCodificada}.${aBase64Url(firma)}`;
}

/**
 * Verifica la firma y el vencimiento de un token de sesión.
 * Devuelve el rol de la sesión si el token es válido, o null si no lo es.
 */
export async function verificarTokenSesion(
  token: string
): Promise<RolSesion | null> {
  const partes = token.split(".");
  if (partes.length !== 2) {
    return null;
  }
  const [cargaCodificada, firmaBase64Url] = partes;

  let firma: Uint8Array<ArrayBuffer>;
  try {
    firma = desdeBase64Url(firmaBase64Url);
  } catch {
    return null;
  }

  const clave = await importarClaveHmac();
  const firmaValida = await crypto.subtle.verify(
    "HMAC",
    clave,
    firma,
    new TextEncoder().encode(cargaCodificada)
  );
  if (!firmaValida) {
    return null;
  }

  let carga: CargaSesion;
  try {
    carga = JSON.parse(new TextDecoder().decode(desdeBase64Url(cargaCodificada)));
  } catch {
    return null;
  }

  if (
    !ROLES_VALIDOS.includes(carga.rol) ||
    !Number.isInteger(carga.vencimiento) ||
    carga.vencimiento < Math.floor(Date.now() / 1000)
  ) {
    return null;
  }

  return carga.rol;
}
