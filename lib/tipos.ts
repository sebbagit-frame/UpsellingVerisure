export type SistemaAlarma = "Verifast" | "Presense";

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
