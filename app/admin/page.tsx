import Link from "next/link";

const SECCIONES = [
  {
    href: "/admin/operadores",
    titulo: "Operadores",
    descripcion: "Alta, edición y baja de operadores del sector",
  },
  {
    href: "/admin/sectores",
    titulo: "Sectores",
    descripcion: "Gestión de sectores e internos",
  },
  {
    href: "/admin/dispositivos",
    titulo: "Dispositivos",
    descripcion: "Gestión del catálogo de dispositivos",
  },
];

export default function AdminPage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Administración</h1>
      <p className="mb-6 text-gray-600">
        Elegí la sección que querés gestionar.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECCIONES.map((seccion) => (
          <Link
            key={seccion.href}
            href={seccion.href}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-gray-400 hover:shadow-md"
          >
            <span className="block text-lg font-semibold">
              {seccion.titulo}
            </span>
            <span className="mt-1 block text-sm text-gray-600">
              {seccion.descripcion}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
