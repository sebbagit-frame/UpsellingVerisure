"use client";

import { useMemo, useState } from "react";
import { Dispositivo, SistemaAlarma } from "@/lib/tipos";
import CardDispositivo from "@/components/CardDispositivo";

const SISTEMAS: { nombre: SistemaAlarma; descripcion: string }[] = [
  { nombre: "Verifast", descripcion: "Sistema de alarma Verifast" },
  { nombre: "Presense", descripcion: "Sistema de alarma Presense" },
];

interface Props {
  dispositivos: Dispositivo[];
}

export default function CatalogoDispositivos({ dispositivos }: Props) {
  const [sistemaSeleccionado, setSistemaSeleccionado] =
    useState<SistemaAlarma | null>(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [dispositivoExpandidoId, setDispositivoExpandidoId] = useState<
    number | null
  >(null);

  const dispositivosDelSistema = useMemo(
    () =>
      dispositivos.filter(
        (dispositivo) => dispositivo.sistema === sistemaSeleccionado
      ),
    [dispositivos, sistemaSeleccionado]
  );

  const dispositivosFiltrados = useMemo(() => {
    const termino = terminoBusqueda.trim().toLowerCase();
    if (!termino) {
      return dispositivosDelSistema;
    }
    return dispositivosDelSistema.filter((dispositivo) =>
      dispositivo.nombre_dispositivo.toLowerCase().includes(termino)
    );
  }, [dispositivosDelSistema, terminoBusqueda]);

  function seleccionarSistema(sistema: SistemaAlarma) {
    setSistemaSeleccionado(sistema);
    setTerminoBusqueda("");
    setDispositivoExpandidoId(null);
  }

  function volverAlSelector() {
    setSistemaSeleccionado(null);
    setTerminoBusqueda("");
    setDispositivoExpandidoId(null);
  }

  // Vista inicial: selector de sistema
  if (!sistemaSeleccionado) {
    return (
      <div>
        <p className="mb-4 text-gray-600">Elegí el sistema de alarma:</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {SISTEMAS.map((sistema) => (
            <button
              key={sistema.nombre}
              type="button"
              onClick={() => seleccionarSistema(sistema.nombre)}
              className={`rounded-xl border-2 p-8 text-left shadow-sm transition hover:shadow-md ${
                sistema.nombre === "Verifast"
                  ? "border-blue-200 bg-blue-50 hover:border-blue-400"
                  : "border-emerald-200 bg-emerald-50 hover:border-emerald-400"
              }`}
            >
              <span
                className={`block text-2xl font-bold ${
                  sistema.nombre === "Verifast"
                    ? "text-blue-900"
                    : "text-emerald-900"
                }`}
              >
                {sistema.nombre}
              </span>
              <span className="mt-1 block text-sm text-gray-600">
                {sistema.descripcion}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Vista de sistema elegido: buscador + grilla
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={volverAlSelector}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          ← Cambiar de sistema
        </button>
        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${
            sistemaSeleccionado === "Verifast"
              ? "bg-blue-100 text-blue-900"
              : "bg-emerald-100 text-emerald-900"
          }`}
        >
          {sistemaSeleccionado}
        </span>
      </div>

      {dispositivosDelSistema.length === 0 ? (
        <p className="rounded-lg border border-gray-200 bg-white p-6 text-gray-600">
          No hay dispositivos cargados todavía en este sistema.
        </p>
      ) : (
        <>
          <input
            type="search"
            value={terminoBusqueda}
            onChange={(evento) => setTerminoBusqueda(evento.target.value)}
            placeholder="Buscar por nombre de dispositivo..."
            className="mb-6 w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />

          {dispositivosFiltrados.length === 0 ? (
            <p className="rounded-lg border border-gray-200 bg-white p-6 text-gray-600">
              No se encontraron dispositivos con ese nombre.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dispositivosFiltrados.map((dispositivo) => (
                <CardDispositivo
                  key={dispositivo.id}
                  dispositivo={dispositivo}
                  expandido={dispositivoExpandidoId === dispositivo.id}
                  alAlternar={() =>
                    setDispositivoExpandidoId(
                      dispositivoExpandidoId === dispositivo.id
                        ? null
                        : dispositivo.id
                    )
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
