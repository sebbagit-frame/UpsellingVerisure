"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  async function manejarCierreSesion() {
    setCerrandoSesion(true);
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setCerrandoSesion(false);
    }
  }

  return (
    <button
      type="button"
      onClick={manejarCierreSesion}
      disabled={cerrandoSesion}
      className="text-sm font-medium text-gray-500 hover:text-gray-900 disabled:opacity-50"
    >
      {cerrandoSesion ? "Saliendo..." : "Cerrar sesión"}
    </button>
  );
}
