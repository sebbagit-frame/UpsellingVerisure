import {
  FileSpreadsheet,
  FileText,
  FileType,
  Image as IconoImagen,
  Link as IconoEnlace,
  LucideIcon,
} from "lucide-react";
import { TipoRecurso } from "@/lib/tipos";

/**
 * Identidad visual de cada tipo de recurso: ícono, color del ícono y del
 * tile de fondo. Se comparte entre la página pública de Instructivos y la
 * tabla del panel admin para que el mismo tipo se vea igual en los dos lados.
 */
export const ESTILOS_POR_TIPO: Record<
  TipoRecurso,
  { Icono: LucideIcon; clases: string }
> = {
  pdf: { Icono: FileText, clases: "bg-red-50 text-red-600 ring-red-100" },
  excel: {
    Icono: FileSpreadsheet,
    clases: "bg-green-50 text-green-700 ring-green-100",
  },
  word: { Icono: FileType, clases: "bg-blue-50 text-blue-600 ring-blue-100" },
  imagen: {
    Icono: IconoImagen,
    clases: "bg-violet-50 text-violet-600 ring-violet-100",
  },
  enlace: {
    Icono: IconoEnlace,
    clases: "bg-neutral-100 text-corporativo-negro ring-neutral-200",
  },
};

interface Props {
  tipo: TipoRecurso;
  /** "grande" para las tarjetas de Instructivos, "chico" para la tabla admin */
  tamano?: "grande" | "chico";
}

export default function IconoTipoRecurso({ tipo, tamano = "grande" }: Props) {
  const estilo = ESTILOS_POR_TIPO[tipo] ?? ESTILOS_POR_TIPO.pdf;
  const esGrande = tamano === "grande";

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-lg ring-1 ${
        esGrande ? "h-11 w-11" : "h-8 w-8"
      } ${estilo.clases}`}
    >
      <estilo.Icono
        className={esGrande ? "h-5 w-5" : "h-4 w-4"}
        strokeWidth={1.75}
      />
    </span>
  );
}
