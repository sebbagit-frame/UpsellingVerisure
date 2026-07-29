"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Dispositivo, SistemaAlarma } from "@/lib/tipos";
import CardDispositivo from "@/components/CardDispositivo";

const SISTEMAS: { nombre: SistemaAlarma; descripcion: string }[] = [
  { nombre: "Verifast", descripcion: "Sistema de alarma Verifast" },
  { nombre: "Presense", descripcion: "Sistema de alarma Presense" },
];

export default function CatalogoDispositivos() {
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorDeCarga, setErrorDeCarga] = useState(false);
  const [sistemaSeleccionado, setSistemaSeleccionado] =
    useState<SistemaAlarma | null>(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [dispositivoExpandidoId, setDispositivoExpandidoId] = useState<
    number | null
  >(null);

  // Los datos se consultan al montar el componente: cada vez que se entra
  // a la pantalla se trae el catálogo fresco, sin cachés intermedios
  useEffect(() => {
    let componenteActivo = true;

    async function cargarDispositivos() {
      const { data, error } = await supabase
        .from("dispositivos")
        .select(
          "id, nombre_dispositivo, nomenclatura, imagen_url, categoria, caracteristicas, descripcion, speech, sistema"
        )
        .order("nombre_dispositivo");

      if (!componenteActivo) {
        return;
      }
      if (error) {
        setErrorDeCarga(true);
      } else {
        setDispositivos((data ?? []) as Dispositivo[]);
      }
      setCargando(false);
    }

    cargarDispositivos();
    return () => {
      componenteActivo = false;
    };
  }, []);

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

  if (cargando) {
    return (
      <p className="text-corporativo-textoSecundario">
        Cargando dispositivos...
      </p>
    );
  }

  if (errorDeCarga) {
    return (
      <p className="text-corporativo-rojo">
        No se pudieron cargar los dispositivos. Intentá de nuevo más tarde.
      </p>
    );
  }

  // Vista inicial: selector de sistema
  if (!sistemaSeleccionado) {
    return (
      <div>
        <p className="mb-4 text-corporativo-textoSecundario">
          Elegí el sistema de alarma:
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {SISTEMAS.map((sistema) => (
            <button
              key={sistema.nombre}
              type="button"
              onClick={() => seleccionarSistema(sistema.nombre)}
              className={`group rounded-tarjeta border border-gray-200 border-l-4 bg-white p-8 text-left transition hover:shadow-tarjeta ${
                sistema.nombre === "Verifast"
                  ? "border-l-corporativo-rojo hover:border-corporativo-rojo"
                  : "border-l-corporativo-negro hover:border-corporativo-negro"
              }`}
            >
              <span className="block font-titulos text-2xl font-bold tracking-tight text-corporativo-negro">
                {sistema.nombre}
              </span>
              <span className="mt-1 block text-sm text-corporativo-textoSecundario">
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
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-corporativo-negro hover:text-corporativo-negro"
        >
          ← Cambiar de sistema
        </button>
        <span
          className={`rounded-full px-3.5 py-1 font-titulos text-sm font-bold tracking-tight text-white ${
            sistemaSeleccionado === "Verifast"
              ? "bg-corporativo-rojo"
              : "bg-corporativo-negro"
          }`}
        >
          {sistemaSeleccionado}
        </span>
      </div>

      {dispositivosDelSistema.length === 0 ? (
        <p className="rounded-tarjeta border border-gray-200 bg-white p-6 text-corporativo-textoSecundario">
          No hay dispositivos cargados todavía en este sistema.
        </p>
      ) : (
        <>
          <input
            type="search"
            value={terminoBusqueda}
            onChange={(evento) => setTerminoBusqueda(evento.target.value)}
            placeholder="Buscar por nombre de dispositivo..."
            className="mb-6 w-full max-w-md rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm transition-colors focus:border-corporativo-negro focus:outline-none"
          />

          {dispositivosFiltrados.length === 0 ? (
            <p className="rounded-tarjeta border border-gray-200 bg-white p-6 text-corporativo-textoSecundario">
              No se encontraron dispositivos con ese nombre.
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
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
