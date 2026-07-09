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
    <div className="flex min-h-[60vh] items-center justify-center">
      <form
        onSubmit={manejarEnvio}
        className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h1 className="mb-1 text-xl font-bold">Acceso al sector</h1>
        <p className="mb-4 text-sm text-gray-600">
          Ingresá la contraseña compartida del sector.
        </p>

        <label
          htmlFor="contrasena"
          className="mb-1 block text-sm font-medium text-gray-700"
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
          className="mb-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />

        {mensajeError && (
          <p className="mb-3 text-sm text-red-600">{mensajeError}</p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {enviando ? "Verificando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
