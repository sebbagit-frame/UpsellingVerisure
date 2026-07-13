import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { RolSesion } from "@/lib/session";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/dispositivos", label: "Dispositivos" },
  { href: "/instructivos", label: "Instructivos" },
];

interface Props {
  rolSesion: RolSesion | null;
}

export default function Navbar({ rolSesion }: Props) {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            {link.label}
          </Link>
        ))}
        {rolSesion === "admin" && (
          <Link
            href="/admin"
            className="text-sm font-semibold text-amber-700 hover:text-amber-900"
          >
            Administración
          </Link>
        )}
        <div className="ml-auto">
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}
