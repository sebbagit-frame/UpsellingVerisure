"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Aviso } from "@/lib/tipos";

interface FormularioAviso {
  titulo: string;
  mensaje: string;
}

const FORMULARIO_VACIO: FormularioAviso = {
  titulo: "",
  mensaje: "",
};

interface Mensaje {
  tipo: "exito" | "error";
  texto: string;
}

export default function AdminAvisosPage() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [formulario, setFormulario] =
    useState<FormularioAviso>(FORMULARIO_VACIO);
  const [avisoEnEdicionId, setAvisoEnEdicionId] = useState<number | null>(
    null
  );
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);
  const formularioRef = useRef<HTMLFormElement>(null);

  const cargarAvisos = useCallback(async () => {
    setCargando(true);
    try {
      const respuesta = await fetch("/api/admin/avisos");
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        throw new Error(datos?.error);
      }
      setAvisos(datos.avisos);
    } catch {
      setMensaje({
        tipo: "error",
        texto: "No se pudieron cargar los avisos",
      });
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarAvisos();
  }, [cargarAvisos]);

  function comenzarEdicion(aviso: Aviso) {
    setAvisoEnEdicionId(aviso.id);
    // Lleva la vista al formulario, que queda arriba de la tabla
    formularioRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setFormulario({
      titulo: aviso.titulo,
      mensaje: aviso.mensaje,
    });
    setMensaje(null);
  }

  function cancelarEdicion() {
    setAvisoEnEdicionId(null);
    setFormulario(FORMULARIO_VACIO);
  }

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setMensaje(null);

    if (!formulario.titulo.trim()) {
      setMensaje({
        tipo: "error",
        texto: "El título del aviso no puede estar vacío",
      });
      return;
    }
    if (!formulario.mensaje.trim()) {
      setMensaje({
        tipo: "error",
        texto: "El mensaje del aviso no puede estar vacío",
      });
      return;
    }

    setGuardando(true);
    try {
      const esEdicion = avisoEnEdicionId !== null;
      const respuesta = await fetch(
        esEdicion ? `/api/admin/avisos/${avisoEnEdicionId}` : "/api/admin/avisos",
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
          texto: datos?.error ?? "No se pudo guardar el aviso",
        });
        return;
      }
      setMensaje({
        tipo: "exito",
        texto: esEdicion
          ? "Aviso actualizado correctamente"
          : "Aviso creado correctamente",
      });
      cancelarEdicion();
      await cargarAvisos();
    } catch {
      setMensaje({ tipo: "error", texto: "Error de conexión al guardar" });
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarAviso(aviso: Aviso) {
    const confirmado = window.confirm(
      `¿Eliminar el aviso "${aviso.titulo}"? Esta acción no se puede deshacer.`
    );
    if (!confirmado) {
      return;
    }

    setMensaje(null);
    try {
      const respuesta = await fetch(`/api/admin/avisos/${aviso.id}`, {
        method: "DELETE",
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        setMensaje({
          tipo: "error",
          texto: datos?.error ?? "No se pudo eliminar el aviso",
        });
        return;
      }
      if (avisoEnEdicionId === aviso.id) {
        cancelarEdicion();
      }
      setMensaje({ tipo: "exito", texto: "Aviso eliminado correctamente" });
      await cargarAvisos();
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
          Avisos
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
          {avisoEnEdicionId !== null ? "Editar aviso" : "Agregar aviso"}
        </h2>
        <div className="mb-3">
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
            htmlFor="mensaje"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Mensaje
          </label>
          <textarea
            id="mensaje"
            rows={4}
            value={formulario.mensaje}
            onChange={(evento) =>
              setFormulario({ ...formulario, mensaje: evento.target.value })
            }
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-colors focus:border-corporativo-negro focus:outline-none"
          />
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={guardando}
            className="rounded-lg bg-corporativo-negro px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 disabled:opacity-50"
          >
            {guardando
              ? "Guardando..."
              : avisoEnEdicionId !== null
                ? "Guardar cambios"
                : "Agregar"}
          </button>
          {avisoEnEdicionId !== null && (
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
        <p className="text-gray-600">Cargando avisos...</p>
      ) : avisos.length === 0 ? (
        <p className="rounded-tarjeta border border-gray-200 bg-white p-6 text-corporativo-textoSecundario">
          No hay avisos cargados todavía.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-tarjeta border border-gray-200 bg-white shadow-tarjeta">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-corporativo-textoSecundario">
              <tr>
                <th className="px-4 py-3 font-semibold">Título</th>
                <th className="px-4 py-3 font-semibold">Mensaje</th>
                <th className="px-4 py-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {avisos.map((aviso) => (
                <tr
                  key={aviso.id}
                  className="border-b border-gray-100 transition-colors last:border-b-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium">{aviso.titulo}</td>
                  <td className="max-w-md px-4 py-3">
                    <p className="line-clamp-2 whitespace-pre-line text-corporativo-textoSecundario">
                      {aviso.mensaje}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => comenzarEdicion(aviso)}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-corporativo-negro hover:text-corporativo-negro"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminarAviso(aviso)}
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
