"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Operador } from "@/lib/tipos";

interface FormularioOperador {
  nombre_operador: string;
  matricula: string;
  interno: string;
}

const FORMULARIO_VACIO: FormularioOperador = {
  nombre_operador: "",
  matricula: "",
  interno: "",
};

interface Mensaje {
  tipo: "exito" | "error";
  texto: string;
}

export default function AdminOperadoresPage() {
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [cargando, setCargando] = useState(true);
  const [formulario, setFormulario] =
    useState<FormularioOperador>(FORMULARIO_VACIO);
  const [operadorEnEdicionId, setOperadorEnEdicionId] = useState<number | null>(
    null
  );
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);

  const cargarOperadores = useCallback(async () => {
    setCargando(true);
    try {
      const respuesta = await fetch("/api/admin/operadores");
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        throw new Error(datos?.error);
      }
      setOperadores(datos.operadores);
    } catch {
      setMensaje({
        tipo: "error",
        texto: "No se pudieron cargar los operadores",
      });
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarOperadores();
  }, [cargarOperadores]);

  function comenzarEdicion(operador: Operador) {
    setOperadorEnEdicionId(operador.id);
    setFormulario({
      nombre_operador: operador.nombre_operador,
      matricula: operador.matricula,
      interno: operador.interno ?? "",
    });
    setMensaje(null);
  }

  function cancelarEdicion() {
    setOperadorEnEdicionId(null);
    setFormulario(FORMULARIO_VACIO);
  }

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setMensaje(null);

    if (!formulario.nombre_operador.trim()) {
      setMensaje({
        tipo: "error",
        texto: "El nombre del operador no puede estar vacío",
      });
      return;
    }
    if (!formulario.matricula.trim()) {
      setMensaje({ tipo: "error", texto: "La matrícula no puede estar vacía" });
      return;
    }

    setGuardando(true);
    try {
      const esEdicion = operadorEnEdicionId !== null;
      const respuesta = await fetch(
        esEdicion
          ? `/api/admin/operadores/${operadorEnEdicionId}`
          : "/api/admin/operadores",
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
          texto: datos?.error ?? "No se pudo guardar el operador",
        });
        return;
      }
      setMensaje({
        tipo: "exito",
        texto: esEdicion
          ? "Operador actualizado correctamente"
          : "Operador creado correctamente",
      });
      cancelarEdicion();
      await cargarOperadores();
    } catch {
      setMensaje({ tipo: "error", texto: "Error de conexión al guardar" });
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarOperador(operador: Operador) {
    const confirmado = window.confirm(
      `¿Eliminar al operador "${operador.nombre_operador}"? Esta acción no se puede deshacer.`
    );
    if (!confirmado) {
      return;
    }

    setMensaje(null);
    try {
      const respuesta = await fetch(`/api/admin/operadores/${operador.id}`, {
        method: "DELETE",
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        setMensaje({
          tipo: "error",
          texto: datos?.error ?? "No se pudo eliminar el operador",
        });
        return;
      }
      if (operadorEnEdicionId === operador.id) {
        cancelarEdicion();
      }
      setMensaje({ tipo: "exito", texto: "Operador eliminado correctamente" });
      await cargarOperadores();
    } catch {
      setMensaje({ tipo: "error", texto: "Error de conexión al eliminar" });
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin"
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          ← Volver al panel
        </Link>
        <h1 className="text-3xl font-bold">Operadores</h1>
      </div>

      {mensaje && (
        <p
          className={`mb-4 rounded-md border px-4 py-2 text-sm ${
            mensaje.tipo === "exito"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {mensaje.texto}
        </p>
      )}

      <form
        onSubmit={manejarEnvio}
        className="mb-8 rounded-lg border border-gray-200 bg-white p-4"
      >
        <h2 className="mb-3 text-lg font-semibold">
          {operadorEnEdicionId !== null
            ? "Editar operador"
            : "Agregar operador"}
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label
              htmlFor="nombre_operador"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Nombre
            </label>
            <input
              id="nombre_operador"
              type="text"
              value={formulario.nombre_operador}
              onChange={(evento) =>
                setFormulario({
                  ...formulario,
                  nombre_operador: evento.target.value,
                })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="matricula"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Matrícula
            </label>
            <input
              id="matricula"
              type="text"
              value={formulario.matricula}
              onChange={(evento) =>
                setFormulario({ ...formulario, matricula: evento.target.value })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="interno"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Interno
            </label>
            <input
              id="interno"
              type="text"
              value={formulario.interno}
              onChange={(evento) =>
                setFormulario({ ...formulario, interno: evento.target.value })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={guardando}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {guardando
              ? "Guardando..."
              : operadorEnEdicionId !== null
                ? "Guardar cambios"
                : "Agregar"}
          </button>
          {operadorEnEdicionId !== null && (
            <button
              type="button"
              onClick={cancelarEdicion}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {cargando ? (
        <p className="text-gray-600">Cargando operadores...</p>
      ) : operadores.length === 0 ? (
        <p className="rounded-lg border border-gray-200 bg-white p-6 text-gray-600">
          No hay operadores cargados todavía.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Matrícula</th>
                <th className="px-4 py-3 font-semibold">Interno</th>
                <th className="px-4 py-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {operadores.map((operador) => (
                <tr
                  key={operador.id}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  <td className="px-4 py-3">{operador.nombre_operador}</td>
                  <td className="px-4 py-3">{operador.matricula}</td>
                  <td className="px-4 py-3">{operador.interno ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => comenzarEdicion(operador)}
                        className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminarOperador(operador)}
                        className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
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
