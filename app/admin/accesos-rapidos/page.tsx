"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AccesoRapido } from "@/lib/tipos";

interface FormularioAccesoRapido {
  titulo: string;
  url: string;
}

const FORMULARIO_VACIO: FormularioAccesoRapido = {
  titulo: "",
  url: "",
};

interface Mensaje {
  tipo: "exito" | "error";
  texto: string;
}

export default function AdminAccesosRapidosPage() {
  const [accesosRapidos, setAccesosRapidos] = useState<AccesoRapido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [formulario, setFormulario] =
    useState<FormularioAccesoRapido>(FORMULARIO_VACIO);
  const [accesoEnEdicionId, setAccesoEnEdicionId] = useState<number | null>(
    null
  );
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);
  const formularioRef = useRef<HTMLFormElement>(null);

  const cargarAccesosRapidos = useCallback(async () => {
    setCargando(true);
    try {
      const respuesta = await fetch("/api/admin/accesos-rapidos");
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        throw new Error(datos?.error);
      }
      setAccesosRapidos(datos.accesosRapidos);
    } catch {
      setMensaje({
        tipo: "error",
        texto: "No se pudieron cargar los accesos rápidos",
      });
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarAccesosRapidos();
  }, [cargarAccesosRapidos]);

  function comenzarEdicion(acceso: AccesoRapido) {
    setAccesoEnEdicionId(acceso.id);
    // Lleva la vista al formulario, que queda arriba de la tabla
    formularioRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setFormulario({
      titulo: acceso.titulo,
      url: acceso.url,
    });
    setMensaje(null);
  }

  function cancelarEdicion() {
    setAccesoEnEdicionId(null);
    setFormulario(FORMULARIO_VACIO);
  }

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setMensaje(null);

    if (!formulario.titulo.trim()) {
      setMensaje({
        tipo: "error",
        texto: "El título del acceso rápido no puede estar vacío",
      });
      return;
    }
    const url = formulario.url.trim();
    if (!/^https?:\/\/.+/.test(url)) {
      setMensaje({
        tipo: "error",
        texto: "La URL debe ser un enlace válido que empiece con http:// o https://",
      });
      return;
    }

    setGuardando(true);
    try {
      const esEdicion = accesoEnEdicionId !== null;
      const respuesta = await fetch(
        esEdicion
          ? `/api/admin/accesos-rapidos/${accesoEnEdicionId}`
          : "/api/admin/accesos-rapidos",
        {
          method: esEdicion ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formulario),
        }
      );
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        setMensaje({
          tipo: "error",
          texto: datos?.error ?? "No se pudo guardar el acceso rápido",
        });
        return;
      }
      setMensaje({
        tipo: "exito",
        texto: esEdicion
          ? "Acceso rápido actualizado correctamente"
          : "Acceso rápido creado correctamente",
      });
      cancelarEdicion();
      await cargarAccesosRapidos();
    } catch {
      setMensaje({ tipo: "error", texto: "Error de conexión al guardar" });
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarAcceso(acceso: AccesoRapido) {
    const confirmado = window.confirm(
      `¿Eliminar el acceso rápido "${acceso.titulo}"? Esta acción no se puede deshacer.`
    );
    if (!confirmado) {
      return;
    }

    setMensaje(null);
    try {
      const respuesta = await fetch(
        `/api/admin/accesos-rapidos/${acceso.id}`,
        { method: "DELETE" }
      );
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        setMensaje({
          tipo: "error",
          texto: datos?.error ?? "No se pudo eliminar el acceso rápido",
        });
        return;
      }
      if (accesoEnEdicionId === acceso.id) {
        cancelarEdicion();
      }
      setMensaje({
        tipo: "exito",
        texto: "Acceso rápido eliminado correctamente",
      });
      await cargarAccesosRapidos();
    } catch {
      setMensaje({ tipo: "error", texto: "Error de conexión al eliminar" });
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin"
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-corporativo-negro hover:text-corporativo-negro"
        >
          ← Volver al panel
        </Link>
        <h1 className="font-titulos text-3xl font-bold tracking-tight">
          Accesos rápidos
        </h1>
      </div>

      {mensaje && (
        <p
          className={`mb-4 rounded-lg border-l-4 px-4 py-2.5 text-sm ${
            mensaje.tipo === "exito"
              ? "border-green-600 bg-green-50 text-green-800"
              : "border-red-600 bg-red-50 text-red-700"
          }`}
        >
          {mensaje.texto}
        </p>
      )}

      <form
        ref={formularioRef}
        onSubmit={manejarEnvio}
        className="mb-8 rounded-tarjeta border border-gray-200 bg-white p-6 shadow-tarjeta"
      >
        <h2 className="mb-4 font-titulos text-lg font-bold tracking-tight">
          {accesoEnEdicionId !== null
            ? "Editar acceso rápido"
            : "Agregar acceso rápido"}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="titulo"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Título
            </label>
            <input
              id="titulo"
              type="text"
              value={formulario.titulo}
              onChange={(evento) =>
                setFormulario({ ...formulario, titulo: evento.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-colors focus:border-corporativo-negro focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="url"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              URL
            </label>
            <input
              id="url"
              type="url"
              placeholder="https://..."
              value={formulario.url}
              onChange={(evento) =>
                setFormulario({ ...formulario, url: evento.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-colors focus:border-corporativo-negro focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={guardando}
            className="rounded-lg bg-corporativo-negro px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 disabled:opacity-50"
          >
            {guardando
              ? "Guardando..."
              : accesoEnEdicionId !== null
                ? "Guardar cambios"
                : "Agregar"}
          </button>
          {accesoEnEdicionId !== null && (
            <button
              type="button"
              onClick={cancelarEdicion}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-corporativo-negro hover:text-corporativo-negro"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {cargando ? (
        <p className="text-gray-600">Cargando accesos rápidos...</p>
      ) : accesosRapidos.length === 0 ? (
        <p className="rounded-tarjeta border border-gray-200 bg-white p-6 text-corporativo-textoSecundario">
          No hay accesos rápidos cargados todavía.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-tarjeta border border-gray-200 bg-white shadow-tarjeta">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-corporativo-textoSecundario">
              <tr>
                <th className="px-4 py-3 font-semibold">Título</th>
                <th className="px-4 py-3 font-semibold">URL</th>
                <th className="px-4 py-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {accesosRapidos.map((acceso) => (
                <tr
                  key={acceso.id}
                  className="border-b border-gray-100 transition-colors last:border-b-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium">{acceso.titulo}</td>
                  <td className="max-w-md px-4 py-3">
                    <a
                      href={acceso.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-corporativo-rojo hover:underline"
                    >
                      {acceso.url}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => comenzarEdicion(acceso)}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-corporativo-negro hover:text-corporativo-negro"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminarAcceso(acceso)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:border-red-600 hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
