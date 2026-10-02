"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import { RolSesion } from "@/lib/session";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/dispositivos", label: "Dispositivos" },
  { href: "/instructivos", label: "Instructivos" },
];

const UMBRAL_SCROLL_COMPACTO = 24;

interface Props {
  rolSesion: RolSesion | null;
}

export default function Navbar({ rolSesion }: Props) {
  const rutaActual = usePathname();
  const [compacto, setCompacto] = useState(false);

  useEffect(() => {
    function manejarScroll() {
      setCompacto(window.scrollY > UMBRAL_SCROLL_COMPACTO);
    }

    manejarScroll();
    window.addEventListener("scroll", manejarScroll, { passive: true });
    return () => window.removeEventListener("scroll", manejarScroll);
  }, []);

  function esLinkActivo(href: string): boolean {
    return href === "/" ? rutaActual === "/" : rutaActual.startsWith(href);
  }

  const claseBase = `border-b-2 px-0.5 text-sm transition-all duration-300 sm:text-base ${
    compacto
      ? "pb-1.5 pt-2 sm:pb-2.5 sm:pt-2.5"
      : "pb-2.5 pt-3 sm:pb-4 sm:pt-[18px]"
  }`;
  const claseInactivo =
    "border-transparent font-medium text-corporativo-textoSecundario hover:text-corporativo-negro";
  const claseActivo =
    "border-corporativo-rojo font-semibold text-corporativo-negro";

  return (
    <nav
      className={`sticky top-0 z-50 border-b border-gray-200 transition-all duration-300 ${
        compacto ? "bg-white/90 shadow-sm backdrop-blur-md" : "bg-white"
      }`}
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-5 px-4 sm:gap-x-9">
        <Link
          href="/"
          className={`transition-all duration-300 ${compacto ? "py-1.5 sm:py-2" : "py-2.5 sm:py-3"}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-icons/logo_Verisure.png"
            alt="Verisure"
            className={`w-auto transition-all duration-300 ${compacto ? "h-7 sm:h-9" : "h-8 sm:h-11"}`}
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
        <div
          className={`ml-auto transition-all duration-300 ${compacto ? "py-1.5 sm:py-2" : "py-2.5 sm:py-3"}`}
        >
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}
