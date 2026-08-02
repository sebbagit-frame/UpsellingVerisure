"use client";

import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Dispositivo, SistemaAlarma } from "@/lib/tipos";
import CardDispositivo from "@/components/CardDispositivo";
import {
  estiloRetrasoEscalonado,
  useRevelarAlEntrar,
} from "@/lib/hooks/useRevelarAlEntrar";

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

  const { referencia: referenciaGrilla, visible: grillaVisible } =
    useRevelarAlEntrar<HTMLDivElement>();

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

  // Vista inicial: selector de sistema, centrado en la altura disponible
  if (!sistemaSeleccionado) {
    return (
      <div className="flex min-h-[55vh] flex-col justify-center">
        <p className="mb-10 max-w-3xl text-sm font-light leading-relaxed text-corporativo-textoSecundario sm:text-base">
          A continuación vamos a realizar una breve descripción de nuestros
          dispositivos con toda la información que debemos brindarle al cliente
          y qué preguntas no hay que olvidar hacer para que la instalación sea
          un éxito.
        </p>
        <p className="mb-5 font-titulos text-lg font-bold tracking-tight">
          Elegí el sistema de alarma:
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          {SISTEMAS.map((sistema, indice) => {
            const esVerifast = sistema.nombre === "Verifast";
            return (
              <button
                key={sistema.nombre}
                type="button"
                onClick={() => seleccionarSistema(sistema.nombre)}
                className={`group animar-aparicion rounded-tarjeta border border-gray-200 border-l-4 p-10 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${
                  esVerifast
                    ? "border-l-corporativo-rojo bg-red-50/60 hover:border-corporativo-rojo"
                    : "border-l-corporativo-negro bg-neutral-100/80 hover:border-corporativo-negro"
                }`}
                style={estiloRetrasoEscalonado(indice, 140)}
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-lg text-white ${
                    esVerifast ? "bg-corporativo-rojo" : "bg-corporativo-negro"
                  }`}
                >
                  {esVerifast ? (
                    <Zap className="h-6 w-6" strokeWidth={1.75} />
                  ) : (
                    <ShieldCheck className="h-6 w-6" strokeWidth={1.75} />
                  )}
                </span>
                <span className="mt-5 block font-titulos text-3xl font-bold tracking-tight text-corporativo-negro">
                  {sistema.nombre}
                </span>
                <span className="mt-1.5 block text-sm text-corporativo-textoSecundario">
                  {sistema.descripcion}
                </span>
              </button>
            );
          })}
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
            <div ref={referenciaGrilla} className="grid gap-5 sm:grid-cols-2">
              {dispositivosFiltrados.map((dispositivo, indice) => (
                <div
                  key={dispositivo.id}
                  className={`${
                    dispositivoExpandidoId === dispositivo.id
                      ? "sm:col-span-2"
                      : ""
                  } ${grillaVisible ? "animar-aparicion" : "opacity-0"}`}
                  style={estiloRetrasoEscalonado(indice)}
                >
                  <CardDispositivo
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
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
