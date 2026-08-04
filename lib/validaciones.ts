import { SistemaAlarma } from "@/lib/tipos";

const SISTEMAS_VALIDOS: SistemaAlarma[] = ["Verifast", "Presense"];

export interface DatosDispositivo {
  nombre_dispositivo: string;
  nomenclatura: string | null;
  categoria: string | null;
  caracteristicas: string | null;
  descripcion: string | null;
  speech: string | null;
  imagen_url: string | null;
  sistema: SistemaAlarma;
}

function normalizarTextoOpcional(valor: unknown): string | null {
  return typeof valor === "string" && valor.trim() ? valor.trim() : null;
}

/**
 * Valida el cuerpo recibido para crear o editar un dispositivo.
 * Devuelve los datos normalizados o un mensaje de error.
 */
export function validarDatosDispositivo(
  cuerpo: unknown
): { datos: DatosDispositivo } | { error: string } {
  if (typeof cuerpo !== "object" || cuerpo === null) {
    return { error: "Cuerpo de la solicitud inválido" };
  }
  const {
    nombre_dispositivo,
    nomenclatura,
    categoria,
    caracteristicas,
    descripcion,
    speech,
    imagen_url,
    sistema,
  } = cuerpo as Record<string, unknown>;

  if (typeof nombre_dispositivo !== "string" || !nombre_dispositivo.trim()) {
    return { error: "El nombre del dispositivo no puede estar vacío" };
  }
  if (
    typeof sistema !== "string" ||
    !SISTEMAS_VALIDOS.includes(sistema as SistemaAlarma)
  ) {
    return { error: "El sistema debe ser Verifast o Presense" };
  }

  return {
    datos: {
      nombre_dispositivo: nombre_dispositivo.trim(),
      nomenclatura: normalizarTextoOpcional(nomenclatura),
      categoria: normalizarTextoOpcional(categoria),
      caracteristicas: normalizarTextoOpcional(caracteristicas),
      descripcion: normalizarTextoOpcional(descripcion),
      speech: normalizarTextoOpcional(speech),
      imagen_url: normalizarTextoOpcional(imagen_url),
      sistema: sistema as SistemaAlarma,
    },
  };
}

import { CategoriaRecurso, TipoRecurso } from "@/lib/tipos";

const TIPOS_RECURSO_VALIDOS: TipoRecurso[] = ["pdf", "excel", "word", "enlace"];
const CATEGORIAS_RECURSO_VALIDAS: CategoriaRecurso[] = [
  "usos_basicos",
  "upselling",
];

export interface DatosRecurso {
  titulo: string;
  tipo: TipoRecurso;
  categoria: CategoriaRecurso;
  archivo_url: string | null;
  enlace_externo: string | null;
  dispositivo_id: number | null;
}

/**
 * Valida el cuerpo recibido para crear o editar un recurso.
 * Debe tener exactamente una fuente: archivo_url O enlace_externo.
 */
export function validarDatosRecurso(
  cuerpo: unknown
): { datos: DatosRecurso } | { error: string } {
  if (typeof cuerpo !== "object" || cuerpo === null) {
    return { error: "Cuerpo de la solicitud inválido" };
  }
  const { titulo, tipo, categoria, archivo_url, enlace_externo, dispositivo_id } =
    cuerpo as Record<string, unknown>;

  if (typeof titulo !== "string" || !titulo.trim()) {
    return { error: "El título del recurso no puede estar vacío" };
  }
  if (
    typeof tipo !== "string" ||
    !TIPOS_RECURSO_VALIDOS.includes(tipo as TipoRecurso)
  ) {
    return { error: "El tipo debe ser pdf, excel, word o enlace" };
  }
  if (
    typeof categoria !== "string" ||
    !CATEGORIAS_RECURSO_VALIDAS.includes(categoria as CategoriaRecurso)
  ) {
    return { error: "La categoría debe ser usos_basicos o upselling" };
  }

  const archivoNormalizado =
    typeof archivo_url === "string" && archivo_url.trim()
      ? archivo_url.trim()
      : null;
  const enlaceNormalizado =
    typeof enlace_externo === "string" && enlace_externo.trim()
      ? enlace_externo.trim()
      : null;

  if (!archivoNormalizado && !enlaceNormalizado) {
    return { error: "El recurso debe tener un archivo o un enlace externo" };
  }
  if (archivoNormalizado && enlaceNormalizado) {
    return {
      error: "El recurso no puede tener archivo y enlace externo a la vez",
    };
  }
  if (enlaceNormalizado && !/^https?:\/\/.+/.test(enlaceNormalizado)) {
    return {
      error: "El enlace externo debe empezar con http:// o https://",
    };
  }

  let dispositivoIdNormalizado: number | null = null;
  if (dispositivo_id !== null && dispositivo_id !== undefined && dispositivo_id !== "") {
    const idNumerico = Number(dispositivo_id);
    if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
      return { error: "El dispositivo asociado es inválido" };
    }
    dispositivoIdNormalizado = idNumerico;
  }

  return {
    datos: {
      titulo: titulo.trim(),
      tipo: tipo as TipoRecurso,
      categoria: categoria as CategoriaRecurso,
      archivo_url: archivoNormalizado,
      enlace_externo: enlaceNormalizado,
      dispositivo_id: dispositivoIdNormalizado,
    },
  };
}

export interface DatosAviso {
  titulo: string;
  mensaje: string;
}

/**
 * Valida el cuerpo recibido para crear o editar un aviso.
 * Devuelve los datos normalizados o un mensaje de error.
 */
export function validarDatosAviso(
  cuerpo: unknown
): { datos: DatosAviso } | { error: string } {
  if (typeof cuerpo !== "object" || cuerpo === null) {
    return { error: "Cuerpo de la solicitud inválido" };
  }
  const { titulo, mensaje } = cuerpo as Record<string, unknown>;

  if (typeof titulo !== "string" || !titulo.trim()) {
    return { error: "El título del aviso no puede estar vacío" };
  }
  if (typeof mensaje !== "string" || !mensaje.trim()) {
    return { error: "El mensaje del aviso no puede estar vacío" };
  }

  return {
    datos: {
      titulo: titulo.trim(),
      mensaje: mensaje.trim(),
    },
  };
}

export interface DatosAccesoRapido {
  titulo: string;
  url: string;
}

/**
 * Valida el cuerpo recibido para crear o editar un acceso rápido.
 * La URL debe ser un enlace http(s) válido.
 */
export function validarDatosAccesoRapido(
  cuerpo: unknown
): { datos: DatosAccesoRapido } | { error: string } {
  if (typeof cuerpo !== "object" || cuerpo === null) {
    return { error: "Cuerpo de la solicitud inválido" };
  }
  const { titulo, url } = cuerpo as Record<string, unknown>;

  if (typeof titulo !== "string" || !titulo.trim()) {
    return { error: "El título del acceso rápido no puede estar vacío" };
  }
  if (typeof url !== "string" || !url.trim()) {
    return { error: "La URL del acceso rápido no puede estar vacía" };
  }

  const urlNormalizada = url.trim();
  let urlValida = false;
  try {
    const urlParseada = new URL(urlNormalizada);
    urlValida =
      urlParseada.protocol === "http:" || urlParseada.protocol === "https:";
  } catch {
    urlValida = false;
  }
  if (!urlValida) {
    return {
      error: "La URL debe ser un enlace válido que empiece con http:// o https://",
    };
  }

  return {
    datos: {
      titulo: titulo.trim(),
      url: urlNormalizada,
    },
  };
}

export interface DatosSector {
  sector: string;
  interno: string | null;
}

/**
 * Valida el cuerpo recibido para crear o editar un sector.
 * Devuelve los datos normalizados o un mensaje de error.
 */
export function validarDatosSector(
  cuerpo: unknown
): { datos: DatosSector } | { error: string } {
  if (typeof cuerpo !== "object" || cuerpo === null) {
    return { error: "Cuerpo de la solicitud inválido" };
  }
  const { sector, interno } = cuerpo as Record<string, unknown>;

  if (typeof sector !== "string" || !sector.trim()) {
    return { error: "El nombre del sector no puede estar vacío" };
  }

  return {
    datos: {
      sector: sector.trim(),
      interno:
        typeof interno === "string" && interno.trim() ? interno.trim() : null,
    },
  };
}

export interface DatosOperador {
  nombre_operador: string;
  matricula: string;
  interno: string | null;
  foto_url: string | null;
}

/**
 * Valida el cuerpo recibido para crear o editar un operador.
 * Devuelve los datos normalizados o un mensaje de error.
 */
export function validarDatosOperador(
  cuerpo: unknown
): { datos: DatosOperador } | { error: string } {
  if (typeof cuerpo !== "object" || cuerpo === null) {
    return { error: "Cuerpo de la solicitud inválido" };
  }
  const { nombre_operador, matricula, interno, foto_url } = cuerpo as Record<
    string,
    unknown
  >;

  if (typeof nombre_operador !== "string" || !nombre_operador.trim()) {
    return { error: "El nombre del operador no puede estar vacío" };
  }
  if (typeof matricula !== "string" || !matricula.trim()) {
    return { error: "La matrícula no puede estar vacía" };
  }

  return {
    datos: {
      nombre_operador: nombre_operador.trim(),
      matricula: matricula.trim(),
      interno:
        typeof interno === "string" && interno.trim() ? interno.trim() : null,
      foto_url:
        typeof foto_url === "string" && foto_url.trim()
          ? foto_url.trim()
          : null,
    },
  };
}
