import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/dispositivos", label: "Dispositivos" },
  { href: "/instructivos", label: "Instructivos" },
];

export default function Navbar() {
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
        <div className="ml-auto">
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}
