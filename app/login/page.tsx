"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [contrasena, setContrasena] = useState("");
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setMensajeError(null);
    setEnviando(true);

    try {
      const respuesta = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contrasena }),
      });

      if (respuesta.ok) {
        router.push("/");
        router.refresh();
        return;
      }

      const datos = await respuesta.json().catch(() => null);
      setMensajeError(datos?.error ?? "No se pudo iniciar sesión");
    } catch {
      setMensajeError("Error de conexión. Intentá de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-sm">
        <form
          onSubmit={manejarEnvio}
          className="overflow-hidden rounded-tarjeta border border-gray-200 bg-white shadow-tarjeta"
        >
          {/* Franja superior de marca con el logo */}
          <div className="border-b-4 border-corporativo-rojo bg-corporativo-negro px-7 py-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-icons/logo_Verisure.png"
              alt="Verisure"
              className="h-8 w-auto brightness-0 invert"
            />
          </div>

          <div className="p-7">
            <h1 className="font-titulos text-2xl font-bold tracking-tight">
              Acceso al sector
            </h1>
            <p className="mb-6 mt-1 text-sm text-corporativo-textoSecundario">
              Ingresá la contraseña compartida del sector.
            </p>

            <label
              htmlFor="contrasena"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Contraseña
            </label>
            <input
              id="contrasena"
              type="password"
              value={contrasena}
              onChange={(evento) => setContrasena(evento.target.value)}
              required
              autoFocus
              className="mb-4 w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-colors focus:border-corporativo-negro focus:outline-none"
            />

            {mensajeError && (
              <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                {mensajeError}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="w-full rounded-lg bg-corporativo-rojo px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {enviando ? "Verificando..." : "Ingresar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
