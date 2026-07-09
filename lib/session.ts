const DURACION_SESION_SEGUNDOS = 60 * 60 * 24 * 30; // 30 días

export const NOMBRE_COOKIE_SESION = "sesion_sector";

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

function aBase64Url(datos: ArrayBuffer): string {
  const bytes = new Uint8Array(datos);
  let binario = "";
  for (const byte of bytes) {
    binario += String.fromCharCode(byte);
  }
  return btoa(binario).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function desdeBase64Url(texto: string): Uint8Array {
  const base64 = texto.replace(/-/g, "+").replace(/_/g, "/");
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) {
    bytes[i] = binario.charCodeAt(i);
  }
  return bytes;
}

/**
 * Crea un token de sesión con vencimiento a 30 días, firmado con HMAC-SHA256.
 * Formato: "<timestampVencimiento>.<firmaBase64Url>"
 */
export async function crearTokenSesion(): Promise<string> {
  const vencimiento = Math.floor(Date.now() / 1000) + DURACION_SESION_SEGUNDOS;
  const carga = String(vencimiento);
  const clave = await importarClaveHmac();
  const firma = await crypto.subtle.sign(
    "HMAC",
    clave,
    new TextEncoder().encode(carga)
  );
  return `${carga}.${aBase64Url(firma)}`;
}

/**
 * Verifica la firma y el vencimiento de un token de sesión.
 */
export async function verificarTokenSesion(token: string): Promise<boolean> {
  const partes = token.split(".");
  if (partes.length !== 2) {
    return false;
  }
  const [carga, firmaBase64Url] = partes;

  const vencimiento = Number(carga);
  if (!Number.isInteger(vencimiento) || vencimiento < Math.floor(Date.now() / 1000)) {
    return false;
  }

  let firma: Uint8Array;
  try {
    firma = desdeBase64Url(firmaBase64Url);
  } catch {
    return false;
  }

  const clave = await importarClaveHmac();
  return crypto.subtle.verify(
    "HMAC",
    clave,
    firma,
    new TextEncoder().encode(carga)
  );
}
