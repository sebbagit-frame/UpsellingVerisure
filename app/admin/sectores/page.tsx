"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Sector } from "@/lib/tipos";

interface FormularioSector {
  sector: string;
  interno: string;
}

const FORMULARIO_VACIO: FormularioSector = {
  sector: "",
  interno: "",
};

interface Mensaje {
  tipo: "exito" | "error";
  texto: string;
}

export default function AdminSectoresPage() {
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [cargando, setCargando] = useState(true);
  const [formulario, setFormulario] =
    useState<FormularioSector>(FORMULARIO_VACIO);
  const [sectorEnEdicionId, setSectorEnEdicionId] = useState<number | null>(
    null
  );
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);

  const cargarSectores = useCallback(async () => {
    setCargando(true);
    try {
      const respuesta = await fetch("/api/admin/sectores");
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        throw new Error(datos?.error);
      }
      setSectores(datos.sectores);
    } catch {
      setMensaje({
        tipo: "error",
        texto: "No se pudieron cargar los sectores",
      });
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarSectores();
  }, [cargarSectores]);

  function comenzarEdicion(sector: Sector) {
    setSectorEnEdicionId(sector.id);
    setFormulario({
      sector: sector.sector,
      interno: sector.interno ?? "",
    });
    setMensaje(null);
  }

  function cancelarEdicion() {
    setSectorEnEdicionId(null);
    setFormulario(FORMULARIO_VACIO);
  }

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setMensaje(null);

    if (!formulario.sector.trim()) {
      setMensaje({
        tipo: "error",
        texto: "El nombre del sector no puede estar vacío",
      });
      return;
    }

    setGuardando(true);
    try {
      const esEdicion = sectorEnEdicionId !== null;
      const respuesta = await fetch(
        esEdicion
          ? `/api/admin/sectores/${sectorEnEdicionId}`
          : "/api/admin/sectores",
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
          texto: datos?.error ?? "No se pudo guardar el sector",
        });
        return;
      }
      setMensaje({
        tipo: "exito",
        texto: esEdicion
          ? "Sector actualizado correctamente"
          : "Sector creado correctamente",
      });
      cancelarEdicion();
      await cargarSectores();
    } catch {
      setMensaje({ tipo: "error", texto: "Error de conexión al guardar" });
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarSector(sector: Sector) {
    const confirmado = window.confirm(
      `¿Eliminar el sector "${sector.sector}"? Esta acción no se puede deshacer.`
    );
    if (!confirmado) {
      return;
    }

    setMensaje(null);
    try {
      const respuesta = await fetch(`/api/admin/sectores/${sector.id}`, {
        method: "DELETE",
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        setMensaje({
          tipo: "error",
          texto: datos?.error ?? "No se pudo eliminar el sector",
        });
        return;
      }
      if (sectorEnEdicionId === sector.id) {
        cancelarEdicion();
      }
      setMensaje({ tipo: "exito", texto: "Sector eliminado correctamente" });
      await cargarSectores();
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
        <h1 className="text-3xl font-bold">Sectores</h1>
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
          {sectorEnEdicionId !== null ? "Editar sector" : "Agregar sector"}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="sector"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Nombre
            </label>
            <input
              id="sector"
              type="text"
              value={formulario.sector}
              onChange={(evento) =>
                setFormulario({ ...formulario, sector: evento.target.value })
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
              : sectorEnEdicionId !== null
                ? "Guardar cambios"
                : "Agregar"}
          </button>
          {sectorEnEdicionId !== null && (
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
        <p className="text-gray-600">Cargando sectores...</p>
      ) : sectores.length === 0 ? (
        <p className="rounded-lg border border-gray-200 bg-white p-6 text-gray-600">
          No hay sectores cargados todavía.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Interno</th>
                <th className="px-4 py-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sectores.map((sector) => (
                <tr
                  key={sector.id}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  <td className="px-4 py-3">{sector.sector}</td>
                  <td className="px-4 py-3">{sector.interno ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => comenzarEdicion(sector)}
                        className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminarSector(sector)}
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
