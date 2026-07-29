import Link from "next/link";
import { ArrowRight, Building2, Cpu, Users } from "lucide-react";

const SECCIONES = [
  {
    href: "/admin/operadores",
    titulo: "Operadores",
    descripcion: "Alta, edición y baja de operadores del sector",
    Icono: Users,
  },
  {
    href: "/admin/sectores",
    titulo: "Sectores",
    descripcion: "Gestión de sectores e internos",
    Icono: Building2,
  },
  {
    href: "/admin/dispositivos",
    titulo: "Dispositivos",
    descripcion: "Gestión del catálogo de dispositivos",
    Icono: Cpu,
  },
];

export default function AdminPage() {
  return (
    <div>
      <h1 className="mb-2 font-titulos text-3xl font-bold tracking-tight">
        Administración
      </h1>
      <p className="mb-8 text-corporativo-textoSecundario">
        Elegí la sección que querés gestionar.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECCIONES.map((seccion) => (
          <Link
            key={seccion.href}
            href={seccion.href}
            className="group rounded-tarjeta border border-gray-200 bg-white p-6 transition hover:border-corporativo-negro hover:shadow-tarjeta"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-corporativo-negro text-white transition-colors group-hover:bg-corporativo-rojo">
              <seccion.Icono className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <span className="mt-4 block font-titulos text-lg font-bold tracking-tight">
              {seccion.titulo}
            </span>
            <span className="mt-1 block text-sm text-corporativo-textoSecundario">
              {seccion.descripcion}
            </span>
            <span className="mt-4 flex items-center gap-1 text-sm font-medium text-corporativo-rojo">
              Gestionar
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
