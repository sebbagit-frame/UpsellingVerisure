export type SistemaAlarma = "Verifast" | "Presense";

export type TipoRecurso = "pdf" | "excel" | "word" | "enlace";

export type CategoriaRecurso = "usos_basicos" | "upselling";

export interface Recurso {
  id: number;
  titulo: string;
  tipo: TipoRecurso;
  categoria: CategoriaRecurso;
  archivo_url: string | null;
  enlace_externo: string | null;
  dispositivo_id: number | null;
  fecha_subida: string;
  /** Nombre del dispositivo asociado (join con la tabla dispositivos) */
  dispositivos: { nombre_dispositivo: string } | null;
}

export interface Aviso {
  id: number;
  titulo: string;
  mensaje: string;
}

export interface AccesoRapido {
  id: number;
  titulo: string;
  url: string;
}

export interface Sector {
  id: number;
  sector: string;
  interno: string | null;
}

export type RolOperador = "Supervisor" | "Coordinador" | "Mentor" | "Operador";

export interface Operador {
  id: number;
  nombre_operador: string;
  matricula: string;
  interno: string | null;
  foto_url: string | null;
  rol: RolOperador | null;
}

export interface Dispositivo {
  id: number;
  nombre_dispositivo: string;
  nomenclatura: string | null;
  imagen_url: string | null;
  categoria: string | null;
  caracteristicas: string | null;
  descripcion: string | null;
  speech: string | null;
  sistema: SistemaAlarma;
}
