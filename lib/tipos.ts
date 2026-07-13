export type SistemaAlarma = "Verifast" | "Presense";

export interface Sector {
  id: number;
  sector: string;
  interno: string | null;
}

export interface Operador {
  id: number;
  nombre_operador: string;
  matricula: string;
  interno: string | null;
}

export interface Dispositivo {
  id: number;
  nombre_dispositivo: string;
  nomenclatura: string | null;
  imagen_url: string | null;
  categoria: string | null;
  caracteristicas: string | null;
  descripcion: string | null;
  sistema: SistemaAlarma;
}
