"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Dispositivo, SistemaAlarma } from "@/lib/tipos";

interface FormularioDispositivo {
  nombre_dispositivo: string;
  nomenclatura: string;
  categoria: string;
  caracteristicas: string;
  descripcion: string;
  speech: string;
  sistema: SistemaAlarma;
}

const FORMULARIO_VACIO: FormularioDispositivo = {
  nombre_dispositivo: "",
  nomenclatura: "",
  categoria: "",
  caracteristicas: "",
  descripcion: "",
  speech: "",
  sistema: "Verifast",
};

interface Mensaje {
  tipo: "exito" | "error";
  texto: string;
}

export default function AdminDispositivosPage() {
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [formulario, setFormulario] =
    useState<FormularioDispositivo>(FORMULARIO_VACIO);
  const [imagenActualUrl, setImagenActualUrl] = useState<string | null>(null);
  const [dispositivoEnEdicionId, setDispositivoEnEdicionId] = useState<
    number | null
  >(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);
  const inputArchivoRef = useRef<HTMLInputElement>(null);

  const cargarDispositivos = useCallback(async () => {
    setCargando(true);
    try {
      const respuesta = await fetch("/api/admin/dispositivos");
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        throw new Error(datos?.error);
      }
      setDispositivos(datos.dispositivos);
    } catch {
      setMensaje({
        tipo: "error",
        texto: "No se pudieron cargar los dispositivos",
      });
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDispositivos();
  }, [cargarDispositivos]);

  function limpiarInputArchivo() {
    if (inputArchivoRef.current) {
      inputArchivoRef.current.value = "";
    }
  }

  function comenzarEdicion(dispositivo: Dispositivo) {
    setDispositivoEnEdicionId(dispositivo.id);
    setFormulario({
      nombre_dispositivo: dispositivo.nombre_dispositivo,
      nomenclatura: dispositivo.nomenclatura ?? "",
      categoria: dispositivo.categoria ?? "",
      caracteristicas: dispositivo.caracteristicas ?? "",
      descripcion: dispositivo.descripcion ?? "",
      speech: dispositivo.speech ?? "",
      sistema: dispositivo.sistema,
    });
    setImagenActualUrl(dispositivo.imagen_url);
    limpiarInputArchivo();
    setMensaje(null);
  }

  function cancelarEdicion() {
    setDispositivoEnEdicionId(null);
    setFormulario(FORMULARIO_VACIO);
    setImagenActualUrl(null);
    limpiarInputArchivo();
  }

  /** Sube la imagen seleccionada (si hay) y devuelve su URL pública. */
  async function subirImagenSiCorresponde(): Promise<
    { url: string | null } | { error: string }
  > {
    const archivo = inputArchivoRef.current?.files?.[0];
    if (!archivo) {
      return { url: imagenActualUrl };
    }

    const formularioArchivo = new FormData();
    formularioArchivo.append("archivo", archivo);
    try {
      const respuesta = await fetch("/api/admin/dispositivos/imagen", {
        method: "POST",
        body: formularioArchivo,
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        return { error: datos?.error ?? "No se pudo subir la imagen" };
      }
      return { url: datos.url };
    } catch {
      return { error: "Error de conexión al subir la imagen" };
    }
  }

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setMensaje(null);

    if (!formulario.nombre_dispositivo.trim()) {
      setMensaje({
        tipo: "error",
        texto: "El nombre del dispositivo no puede estar vacío",
      });
      return;
    }

    setGuardando(true);
    try {
      const resultadoImagen = await subirImagenSiCorresponde();
      if ("error" in resultadoImagen) {
        setMensaje({ tipo: "error", texto: resultadoImagen.error });
        return;
      }

      const esEdicion = dispositivoEnEdicionId !== null;
      const respuesta = await fetch(
        esEdicion
          ? `/api/admin/dispositivos/${dispositivoEnEdicionId}`
          : "/api/admin/dispositivos",
        {
          method: esEdicion ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formulario,
            imagen_url: resultadoImagen.url,
          }),
        }
      );
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        setMensaje({
          tipo: "error",
          texto: datos?.error ?? "No se pudo guardar el dispositivo",
        });
        return;
      }
      setMensaje({
        tipo: "exito",
        texto: esEdicion
          ? "Dispositivo actualizado correctamente"
          : "Dispositivo creado correctamente",
      });
      cancelarEdicion();
      await cargarDispositivos();
    } catch {
      setMensaje({ tipo: "error", texto: "Error de conexión al guardar" });
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarDispositivo(dispositivo: Dispositivo) {
    const confirmado = window.confirm(
      `¿Eliminar el dispositivo "${dispositivo.nombre_dispositivo}"? También se borrará su imagen. Esta acción no se puede deshacer.`
    );
    if (!confirmado) {
      return;
    }

    setMensaje(null);
    try {
      const respuesta = await fetch(
        `/api/admin/dispositivos/${dispositivo.id}`,
        { method: "DELETE" }
      );
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        setMensaje({
          tipo: "error",
          texto: datos?.error ?? "No se pudo eliminar el dispositivo",
        });
        return;
      }
      if (dispositivoEnEdicionId === dispositivo.id) {
        cancelarEdicion();
      }
      setMensaje({
        tipo: "exito",
        texto: "Dispositivo eliminado correctamente",
      });
      await cargarDispositivos();
    } catch {
      setMensaje({ tipo: "error", texto: "Error de conexión al eliminar" });
    }
  }

  const claseInput =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none";
  const claseLabel = "mb-1 block text-sm font-medium text-gray-700";

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin"
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          ← Volver al panel
        </Link>
        <h1 className="text-3xl font-bold">Dispositivos</h1>
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
          {dispositivoEnEdicionId !== null
            ? "Editar dispositivo"
            : "Agregar dispositivo"}
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="nombre_dispositivo" className={claseLabel}>
              Nombre
            </label>
            <input
              id="nombre_dispositivo"
              type="text"
              value={formulario.nombre_dispositivo}
              onChange={(evento) =>
                setFormulario({
                  ...formulario,
                  nombre_dispositivo: evento.target.value,
                })
              }
              className={claseInput}
            />
          </div>
          <div>
            <label htmlFor="nomenclatura" className={claseLabel}>
              Nomenclatura
            </label>
            <input
              id="nomenclatura"
              type="text"
              value={formulario.nomenclatura}
              onChange={(evento) =>
                setFormulario({
                  ...formulario,
                  nomenclatura: evento.target.value,
                })
              }
              className={claseInput}
            />
          </div>
          <div>
            <label htmlFor="categoria" className={claseLabel}>
              Categoría
            </label>
            <input
              id="categoria"
              type="text"
              value={formulario.categoria}
              onChange={(evento) =>
                setFormulario({ ...formulario, categoria: evento.target.value })
              }
              className={claseInput}
            />
          </div>
          <div>
            <label htmlFor="sistema" className={claseLabel}>
              Sistema
            </label>
            <select
              id="sistema"
              value={formulario.sistema}
              onChange={(evento) =>
                setFormulario({
                  ...formulario,
                  sistema: evento.target.value as SistemaAlarma,
                })
              }
              className={claseInput}
            >
              <option value="Verifast">Verifast</option>
              <option value="Presense">Presense</option>
            </select>
          </div>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="caracteristicas" className={claseLabel}>
              Características
            </label>
            <textarea
              id="caracteristicas"
              rows={4}
              value={formulario.caracteristicas}
              onChange={(evento) =>
                setFormulario({
                  ...formulario,
                  caracteristicas: evento.target.value,
                })
              }
              className={claseInput}
            />
          </div>
          <div>
            <label htmlFor="descripcion" className={claseLabel}>
              Descripción
            </label>
            <textarea
              id="descripcion"
              rows={4}
              value={formulario.descripcion}
              onChange={(evento) =>
                setFormulario({
                  ...formulario,
                  descripcion: evento.target.value,
                })
              }
              className={claseInput}
            />
          </div>
        </div>

        <div className="mt-3">
          <label htmlFor="speech" className={claseLabel}>
            Speech (guion para la conversación con el cliente)
          </label>
          <textarea
            id="speech"
            rows={4}
            value={formulario.speech}
            onChange={(evento) =>
              setFormulario({ ...formulario, speech: evento.target.value })
            }
            className={claseInput}
          />
        </div>

        <div className="mt-3">
          <label htmlFor="imagen" className={claseLabel}>
            Imagen
          </label>
          {imagenActualUrl && (
            <div className="mb-2 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagenActualUrl}
                alt="Imagen actual del dispositivo"
                className="h-16 w-16 rounded-md border border-gray-200 object-contain"
              />
              <span className="text-sm text-gray-600">
                Imagen actual — seleccioná un archivo para reemplazarla
              </span>
            </div>
          )}
          <input
            id="imagen"
            ref={inputArchivoRef}
            type="file"
            accept="image/*"
            className="block text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-gray-900 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-gray-700"
          />
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={guardando}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {guardando
              ? "Guardando..."
              : dispositivoEnEdicionId !== null
                ? "Guardar cambios"
                : "Agregar"}
          </button>
          {dispositivoEnEdicionId !== null && (
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
        <p className="text-gray-600">Cargando dispositivos...</p>
      ) : dispositivos.length === 0 ? (
        <p className="rounded-lg border border-gray-200 bg-white p-6 text-gray-600">
          No hay dispositivos cargados todavía.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Imagen</th>
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Nomenclatura</th>
                <th className="px-4 py-3 font-semibold">Categoría</th>
                <th className="px-4 py-3 font-semibold">Sistema</th>
                <th className="px-4 py-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {dispositivos.map((dispositivo) => (
                <tr
                  key={dispositivo.id}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  <td className="px-4 py-2">
                    {dispositivo.imagen_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={dispositivo.imagen_url}
                        alt={dispositivo.nombre_dispositivo}
                        className="h-12 w-12 rounded-md border border-gray-200 object-contain"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">Sin imagen</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {dispositivo.nombre_dispositivo}
                  </td>
                  <td className="px-4 py-3">
                    {dispositivo.nomenclatura ?? "—"}
                  </td>
                  <td className="px-4 py-3">{dispositivo.categoria ?? "—"}</td>
                  <td className="px-4 py-3">{dispositivo.sistema}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => comenzarEdicion(dispositivo)}
                        className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminarDispositivo(dispositivo)}
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
