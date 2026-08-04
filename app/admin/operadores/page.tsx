"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Operador } from "@/lib/tipos";

/** Iniciales para el avatar: primera letra de las dos primeras palabras. */
function obtenerIniciales(nombreCompleto: string): string {
  return nombreCompleto
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra[0]?.toUpperCase() ?? "")
    .join("");
}

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
  const [fotoActualUrl, setFotoActualUrl] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);
  const formularioRef = useRef<HTMLFormElement>(null);
  const inputArchivoRef = useRef<HTMLInputElement>(null);

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

  function limpiarInputArchivo() {
    if (inputArchivoRef.current) {
      inputArchivoRef.current.value = "";
    }
  }

  function comenzarEdicion(operador: Operador) {
    setOperadorEnEdicionId(operador.id);
    // Lleva la vista al formulario, que queda arriba de la tabla
    formularioRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setFormulario({
      nombre_operador: operador.nombre_operador,
      matricula: operador.matricula,
      interno: operador.interno ?? "",
    });
    setFotoActualUrl(operador.foto_url);
    limpiarInputArchivo();
    setMensaje(null);
  }

  function cancelarEdicion() {
    setOperadorEnEdicionId(null);
    setFormulario(FORMULARIO_VACIO);
    setFotoActualUrl(null);
    limpiarInputArchivo();
  }

  /** Sube la foto seleccionada (si hay) y devuelve su URL pública. */
  async function subirFotoSiCorresponde(): Promise<
    { url: string | null } | { error: string }
  > {
    const archivo = inputArchivoRef.current?.files?.[0];
    if (!archivo) {
      return { url: fotoActualUrl };
    }

    const formularioArchivo = new FormData();
    formularioArchivo.append("archivo", archivo);
    try {
      const respuesta = await fetch("/api/admin/operadores/foto", {
        method: "POST",
        body: formularioArchivo,
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        return { error: datos?.error ?? "No se pudo subir la foto" };
      }
      return { url: datos.url };
    } catch {
      return { error: "Error de conexión al subir la foto" };
    }
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
      const resultadoFoto = await subirFotoSiCorresponde();
      if ("error" in resultadoFoto) {
        setMensaje({ tipo: "error", texto: resultadoFoto.error });
        return;
      }

      const esEdicion = operadorEnEdicionId !== null;
      const respuesta = await fetch(
        esEdicion
          ? `/api/admin/operadores/${operadorEnEdicionId}`
          : "/api/admin/operadores",
        {
          method: esEdicion ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formulario,
            foto_url: resultadoFoto.url,
          }),
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
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-corporativo-negro hover:text-corporativo-negro"
        >
          ← Volver al panel
        </Link>
        <h1 className="font-titulos text-3xl font-bold tracking-tight">
          Operadores
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
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-colors focus:border-corporativo-negro focus:outline-none"
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
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-colors focus:border-corporativo-negro focus:outline-none"
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
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-colors focus:border-corporativo-negro focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-3">
          <label
            htmlFor="foto"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Foto
          </label>
          {fotoActualUrl && (
            <div className="mb-2 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fotoActualUrl}
                alt="Foto actual del operador"
                className="h-16 w-16 rounded-full border border-gray-200 object-cover"
              />
              <span className="text-sm text-gray-600">
                Foto actual — seleccioná un archivo para reemplazarla
              </span>
            </div>
          )}
          <input
            id="foto"
            ref={inputArchivoRef}
            type="file"
            accept="image/*"
            className="block text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-corporativo-negro file:px-3.5 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-neutral-700"
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
              : operadorEnEdicionId !== null
                ? "Guardar cambios"
                : "Agregar"}
          </button>
          {operadorEnEdicionId !== null && (
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
        <p className="text-gray-600">Cargando operadores...</p>
      ) : operadores.length === 0 ? (
        <p className="rounded-tarjeta border border-gray-200 bg-white p-6 text-corporativo-textoSecundario">
          No hay operadores cargados todavía.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-tarjeta border border-gray-200 bg-white shadow-tarjeta">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-corporativo-textoSecundario">
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
                  className="border-b border-gray-100 transition-colors last:border-b-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {operador.foto_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={operador.foto_url}
                          alt={operador.nombre_operador}
                          className="h-9 w-9 shrink-0 rounded-full border border-gray-200 object-cover"
                        />
                      ) : (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-corporativo-negro text-xs font-semibold text-white">
                          {obtenerIniciales(operador.nombre_operador)}
                        </span>
                      )}
                      <span className="font-medium">
                        {operador.nombre_operador}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono">{operador.matricula}</td>
                  <td className="px-4 py-3">{operador.interno ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => comenzarEdicion(operador)}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-corporativo-negro hover:text-corporativo-negro"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminarOperador(operador)}
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
