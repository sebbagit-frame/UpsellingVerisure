import { SistemaAlarma } from "@/lib/tipos";

const SISTEMAS_VALIDOS: SistemaAlarma[] = ["Verifast", "Presense"];

export interface DatosDispositivo {
  nombre_dispositivo: string;
  nomenclatura: string | null;
  categoria: string | null;
  caracteristicas: string | null;
  descripcion: string | null;
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
      imagen_url: normalizarTextoOpcional(imagen_url),
      sistema: sistema as SistemaAlarma,
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
  const { nombre_operador, matricula, interno } = cuerpo as Record<
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
    },
  };
}
