"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CategoriaRecurso,
  Dispositivo,
  Recurso,
  TipoRecurso,
} from "@/lib/tipos";

interface FormularioRecurso {
  titulo: string;
  tipo: TipoRecurso;
  categoria: CategoriaRecurso;
  dispositivo_id: string;
  enlace_externo: string;
}

const FORMULARIO_VACIO: FormularioRecurso = {
  titulo: "",
  tipo: "pdf",
  categoria: "usos_basicos",
  dispositivo_id: "",
  enlace_externo: "",
};

const ETIQUETAS_TIPO: Record<TipoRecurso, string> = {
  pdf: "PDF",
  excel: "Excel",
  word: "Word",
  enlace: "Enlace",
};

const ETIQUETAS_CATEGORIA: Record<CategoriaRecurso, string> = {
  usos_basicos: "Usos básicos",
  upselling: "Upselling",
};

interface Mensaje {
  tipo: "exito" | "error";
  texto: string;
}

export default function AdminRecursosPage() {
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [formulario, setFormulario] =
    useState<FormularioRecurso>(FORMULARIO_VACIO);
  const [archivoActualUrl, setArchivoActualUrl] = useState<string | null>(null);
  const [recursoEnEdicionId, setRecursoEnEdicionId] = useState<number | null>(
    null
  );
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);
  const formularioRef = useRef<HTMLFormElement>(null);
  const inputArchivoRef = useRef<HTMLInputElement>(null);

  const esTipoConArchivo = formulario.tipo !== "enlace";

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [respuestaRecursos, respuestaDispositivos] = await Promise.all([
        fetch("/api/admin/recursos"),
        fetch("/api/admin/dispositivos"),
      ]);
      const datosRecursos = await respuestaRecursos.json();
      const datosDispositivos = await respuestaDispositivos.json();
      if (!respuestaRecursos.ok) {
        throw new Error(datosRecursos?.error);
      }
      setRecursos(datosRecursos.recursos);
      setDispositivos(
        respuestaDispositivos.ok ? datosDispositivos.dispositivos : []
      );
    } catch {
      setMensaje({
        tipo: "error",
        texto: "No se pudieron cargar los recursos",
      });
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  function limpiarInputArchivo() {
    if (inputArchivoRef.current) {
      inputArchivoRef.current.value = "";
    }
  }

  function comenzarEdicion(recurso: Recurso) {
    setRecursoEnEdicionId(recurso.id);
    // Lleva la vista al formulario, que queda arriba de la tabla
    formularioRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setFormulario({
      titulo: recurso.titulo,
      tipo: recurso.tipo,
      categoria: recurso.categoria,
      dispositivo_id: recurso.dispositivo_id?.toString() ?? "",
      enlace_externo: recurso.enlace_externo ?? "",
    });
    setArchivoActualUrl(recurso.archivo_url);
    limpiarInputArchivo();
    setMensaje(null);
  }

  function cancelarEdicion() {
    setRecursoEnEdicionId(null);
    setFormulario(FORMULARIO_VACIO);
    setArchivoActualUrl(null);
    limpiarInputArchivo();
  }

  /** Sube el archivo seleccionado (si hay) y devuelve su URL pública. */
  async function subirArchivoSiCorresponde(): Promise<
    { url: string | null } | { error: string }
  > {
    const archivo = inputArchivoRef.current?.files?.[0];
    if (!archivo) {
      return { url: archivoActualUrl };
    }

    const formularioArchivo = new FormData();
    formularioArchivo.append("archivo", archivo);
    formularioArchivo.append("tipo", formulario.tipo);
    try {
      const respuesta = await fetch("/api/admin/recursos/archivo", {
        method: "POST",
        body: formularioArchivo,
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        return { error: datos?.error ?? "No se pudo subir el archivo" };
      }
      return { url: datos.url };
    } catch {
      return { error: "Error de conexión al subir el archivo" };
    }
  }

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setMensaje(null);

    if (!formulario.titulo.trim()) {
      setMensaje({
        tipo: "error",
        texto: "El título del recurso no puede estar vacío",
      });
      return;
    }
    if (!esTipoConArchivo && !/^https?:\/\/.+/.test(formulario.enlace_externo.trim())) {
      setMensaje({
        tipo: "error",
        texto: "El enlace externo debe empezar con http:// o https://",
      });
      return;
    }

    setGuardando(true);
    try {
      let archivoUrl: string | null = null;
      if (esTipoConArchivo) {
        const resultadoArchivo = await subirArchivoSiCorresponde();
        if ("error" in resultadoArchivo) {
          setMensaje({ tipo: "error", texto: resultadoArchivo.error });
          return;
        }
        archivoUrl = resultadoArchivo.url;
        if (!archivoUrl) {
          setMensaje({
            tipo: "error",
            texto: "Seleccioná el archivo del recurso",
          });
          return;
        }
      }

      const esEdicion = recursoEnEdicionId !== null;
      const respuesta = await fetch(
        esEdicion
          ? `/api/admin/recursos/${recursoEnEdicionId}`
          : "/api/admin/recursos",
        {
          method: esEdicion ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            titulo: formulario.titulo,
            tipo: formulario.tipo,
            categoria: formulario.categoria,
            dispositivo_id: formulario.dispositivo_id || null,
            archivo_url: esTipoConArchivo ? archivoUrl : null,
            enlace_externo: esTipoConArchivo
              ? null
              : formulario.enlace_externo.trim(),
          }),
        }
      );
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        setMensaje({
          tipo: "error",
          texto: datos?.error ?? "No se pudo guardar el recurso",
        });
        return;
      }
      setMensaje({
        tipo: "exito",
        texto: esEdicion
          ? "Recurso actualizado correctamente"
          : "Recurso creado correctamente",
      });
      cancelarEdicion();
      await cargarDatos();
    } catch {
      setMensaje({ tipo: "error", texto: "Error de conexión al guardar" });
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarRecurso(recurso: Recurso) {
    const confirmado = window.confirm(
      `¿Eliminar el recurso "${recurso.titulo}"? También se borrará su archivo. Esta acción no se puede deshacer.`
    );
    if (!confirmado) {
      return;
    }

    setMensaje(null);
    try {
      const respuesta = await fetch(`/api/admin/recursos/${recurso.id}`, {
        method: "DELETE",
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        setMensaje({
          tipo: "error",
          texto: datos?.error ?? "No se pudo eliminar el recurso",
        });
        return;
      }
      if (recursoEnEdicionId === recurso.id) {
        cancelarEdicion();
      }
      setMensaje({ tipo: "exito", texto: "Recurso eliminado correctamente" });
      await cargarDatos();
    } catch {
      setMensaje({ tipo: "error", texto: "Error de conexión al eliminar" });
    }
  }

  const claseInput =
    "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm transition-colors focus:border-corporativo-negro focus:outline-none";
  const claseLabel = "mb-1.5 block text-sm font-medium text-gray-700";

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
          Recursos
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
          {recursoEnEdicionId !== null ? "Editar recurso" : "Agregar recurso"}
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="titulo" className={claseLabel}>
              Título
            </label>
            <input
              id="titulo"
              type="text"
              value={formulario.titulo}
              onChange={(evento) =>
                setFormulario({ ...formulario, titulo: evento.target.value })
              }
              className={claseInput}
            />
          </div>
          <div>
            <label htmlFor="tipo" className={claseLabel}>
              Tipo
            </label>
            <select
              id="tipo"
              value={formulario.tipo}
              onChange={(evento) =>
                setFormulario({
                  ...formulario,
                  tipo: evento.target.value as TipoRecurso,
                })
              }
              className={claseInput}
            >
              {(Object.keys(ETIQUETAS_TIPO) as TipoRecurso[]).map((tipo) => (
                <option key={tipo} value={tipo}>
                  {ETIQUETAS_TIPO[tipo]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="categoria" className={claseLabel}>
              Categoría
            </label>
            <select
              id="categoria"
              value={formulario.categoria}
              onChange={(evento) =>
                setFormulario({
                  ...formulario,
                  categoria: evento.target.value as CategoriaRecurso,
                })
              }
              className={claseInput}
            >
              {(Object.keys(ETIQUETAS_CATEGORIA) as CategoriaRecurso[]).map(
                (categoria) => (
                  <option key={categoria} value={categoria}>
                    {ETIQUETAS_CATEGORIA[categoria]}
                  </option>
                )
              )}
            </select>
          </div>
          <div>
            <label htmlFor="dispositivo_id" className={claseLabel}>
              Dispositivo asociado (opcional)
            </label>
            <select
              id="dispositivo_id"
              value={formulario.dispositivo_id}
              onChange={(evento) =>
                setFormulario({
                  ...formulario,
                  dispositivo_id: evento.target.value,
                })
              }
              className={claseInput}
            >
              <option value="">Sin dispositivo</option>
              {dispositivos.map((dispositivo) => (
                <option key={dispositivo.id} value={dispositivo.id}>
                  {dispositivo.nombre_dispositivo} ({dispositivo.sistema})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3">
          {esTipoConArchivo ? (
            <div>
              <label htmlFor="archivo" className={claseLabel}>
                Archivo ({ETIQUETAS_TIPO[formulario.tipo]})
              </label>
              {archivoActualUrl && (
                <p className="mb-2 text-sm text-corporativo-textoSecundario">
                  Hay un archivo cargado —{" "}
                  <a
                    href={archivoActualUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-corporativo-rojo hover:underline"
                  >
                    verlo
                  </a>{" "}
                  — seleccioná uno nuevo para reemplazarlo
                </p>
              )}
              <input
                id="archivo"
                ref={inputArchivoRef}
                type="file"
                className="block text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-corporativo-negro file:px-3.5 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-neutral-700"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="enlace_externo" className={claseLabel}>
                Enlace externo
              </label>
              <input
                id="enlace_externo"
                type="url"
                placeholder="https://..."
                value={formulario.enlace_externo}
                onChange={(evento) =>
                  setFormulario({
                    ...formulario,
                    enlace_externo: evento.target.value,
                  })
                }
                className={`${claseInput} max-w-xl`}
              />
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={guardando}
            className="rounded-lg bg-corporativo-negro px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 disabled:opacity-50"
          >
            {guardando
              ? "Guardando..."
              : recursoEnEdicionId !== null
                ? "Guardar cambios"
                : "Agregar"}
          </button>
          {recursoEnEdicionId !== null && (
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
        <p className="text-gray-600">Cargando recursos...</p>
      ) : recursos.length === 0 ? (
        <p className="rounded-tarjeta border border-gray-200 bg-white p-6 text-corporativo-textoSecundario">
          No hay recursos cargados todavía.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-tarjeta border border-gray-200 bg-white shadow-tarjeta">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-corporativo-textoSecundario">
              <tr>
                <th className="px-4 py-3 font-semibold">Título</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Categoría</th>
                <th className="px-4 py-3 font-semibold">Dispositivo</th>
                <th className="px-4 py-3 font-semibold">Fuente</th>
                <th className="px-4 py-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {recursos.map((recurso) => (
                <tr
                  key={recurso.id}
                  className="border-b border-gray-100 transition-colors last:border-b-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium">{recurso.titulo}</td>
                  <td className="px-4 py-3">{ETIQUETAS_TIPO[recurso.tipo]}</td>
                  <td className="px-4 py-3">
                    {ETIQUETAS_CATEGORIA[recurso.categoria]}
                  </td>
                  <td className="px-4 py-3">
                    {recurso.dispositivos?.nombre_dispositivo ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {(recurso.archivo_url ?? recurso.enlace_externo) && (
                      <a
                        href={recurso.archivo_url ?? recurso.enlace_externo!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-corporativo-rojo hover:underline"
                      >
                        {recurso.archivo_url ? "Ver archivo" : "Ver enlace"}
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => comenzarEdicion(recurso)}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-corporativo-negro hover:text-corporativo-negro"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminarRecurso(recurso)}
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
