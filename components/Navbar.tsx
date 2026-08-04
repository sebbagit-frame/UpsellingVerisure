"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import { RolSesion } from "@/lib/session";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/dispositivos", label: "Dispositivos" },
  { href: "/instructivos", label: "Instructivos" },
];

interface Props {
  rolSesion: RolSesion | null;
}

export default function Navbar({ rolSesion }: Props) {
  const rutaActual = usePathname();

  function esLinkActivo(href: string): boolean {
    return href === "/" ? rutaActual === "/" : rutaActual.startsWith(href);
  }

  const claseBase =
    "border-b-2 px-0.5 pb-2.5 pt-3 text-sm transition-colors sm:pb-4 sm:pt-[18px] sm:text-base";
  const claseInactivo =
    "border-transparent font-medium text-corporativo-textoSecundario hover:text-corporativo-negro";
  const claseActivo =
    "border-corporativo-rojo font-semibold text-corporativo-negro";

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-5 px-4 sm:gap-x-9">
        <Link href="/" className="py-2.5 sm:py-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-icons/logo_Verisure.png"
            alt="Verisure"
            className="h-8 w-auto sm:h-11"
          />
        </Link>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${claseBase} ${
              esLinkActivo(link.href) ? claseActivo : claseInactivo
            }`}
          >
            {link.label}
          </Link>
        ))}
        {rolSesion === "admin" && (
          <Link
            href="/admin"
            className={`${claseBase} ${
              esLinkActivo("/admin")
                ? claseActivo
                : "border-transparent font-semibold text-corporativo-rojo hover:text-red-800"
            }`}
          >
            Administración
          </Link>
        )}
        <div className="ml-auto py-2.5 sm:py-3">
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}
