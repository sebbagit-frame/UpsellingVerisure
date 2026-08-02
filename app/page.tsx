"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, Megaphone } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AccesoRapido, Aviso, Operador, Sector } from "@/lib/tipos";
import {
  estiloRetrasoEscalonado,
  useRevelarAlEntrar,
} from "@/lib/hooks/useRevelarAlEntrar";

/** Iniciales para el avatar: primera letra de las dos primeras palabras. */
function obtenerIniciales(nombreCompleto: string): string {
  return nombreCompleto
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra[0]?.toUpperCase() ?? "")
    .join("");
}

export default function InicioPage() {
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [accesosRapidos, setAccesosRapidos] = useState<AccesoRapido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorDeCarga, setErrorDeCarga] = useState(false);

  const { referencia: referenciaAvisos, visible: avisosVisibles } =
    useRevelarAlEntrar<HTMLDivElement>();
  const { referencia: referenciaOperadores, visible: operadoresVisibles } =
    useRevelarAlEntrar<HTMLDivElement>();
  const { referencia: referenciaSectores, visible: sectoresVisibles } =
    useRevelarAlEntrar<HTMLDivElement>();
  const { referencia: referenciaAccesos, visible: accesosVisibles } =
    useRevelarAlEntrar<HTMLElement>();

  useEffect(() => {
    let componenteActivo = true;

    async function cargarDatos() {
      const [
        respuestaOperadores,
        respuestaSectores,
        respuestaAvisos,
        respuestaAccesos,
      ] = await Promise.all([
        supabase
          .from("operadores")
          .select("id, nombre_operador, matricula, interno")
          .order("nombre_operador"),
        supabase.from("sectores").select("id, sector, interno").order("sector"),
        // Avisos y accesos rápidos son opcionales: si la tabla no existe
        // o está vacía, la sección simplemente no se muestra
        supabase.from("avisos").select("id, titulo, mensaje").order("id"),
        supabase.from("accesos_rapidos").select("id, titulo, url").order("id"),
      ]);

      if (!componenteActivo) {
        return;
      }

      if (respuestaOperadores.error || respuestaSectores.error) {
        setErrorDeCarga(true);
      } else {
        setOperadores((respuestaOperadores.data ?? []) as Operador[]);
        setSectores((respuestaSectores.data ?? []) as Sector[]);
      }
      setAvisos(respuestaAvisos.error ? [] : (respuestaAvisos.data as Aviso[]));
      setAccesosRapidos(
        respuestaAccesos.error ? [] : (respuestaAccesos.data as AccesoRapido[])
      );
      setCargando(false);
    }

    cargarDatos();
    return () => {
      componenteActivo = false;
    };
  }, []);

  return (
    <div>
      {/* Hero de bienvenida: fondo a pantalla completa, composición asimétrica.
          "-mt-8" cancela el padding superior del <main> del layout para que
          la franja apoye contra el navbar */}
      <section className="relative left-1/2 -mt-8 mb-10 w-screen -translate-x-1/2 overflow-hidden">
        {/* Bloque negro de fondo: entra deslizándose desde la izquierda */}
        <div
          aria-hidden
          className="animar-fondo-izquierda absolute inset-0 bg-corporativo-negro"
        />
        {/* Franja roja diagonal detrás de los robots: entra desde la derecha */}
        <div
          aria-hidden
          className="animar-fondo-derecha absolute inset-y-0 right-[-90px] hidden w-[36%] -skew-x-12 bg-corporativo-rojo sm:block"
          style={{ "--retraso-aparicion": "120ms" } as React.CSSProperties}
        />
        {/* Texto: protagonismo a la izquierda */}
        <div className="relative mx-auto max-w-5xl px-4">
          <div className="mx-auto max-w-xl pt-12 text-center sm:mx-0 sm:py-24 sm:pr-8 sm:text-left">
            <p
              className="animar-aparicion font-titulos text-xs font-bold uppercase tracking-[0.3em] text-corporativo-rojo sm:text-sm"
              style={{ "--retraso-aparicion": "350ms" } as React.CSSProperties}
            >
              Portal interno del sector
            </p>
            <h1
              className="animar-aparicion mt-3 font-titulos text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl"
              style={{ "--retraso-aparicion": "480ms" } as React.CSSProperties}
            >
              Bienvenido al Portal Upselling
            </h1>
            <p
              className="animar-aparicion mt-6 leading-relaxed text-neutral-300"
              style={{ "--retraso-aparicion": "610ms" } as React.CSSProperties}
            >
              Panel de consulta interno del sector: matrículas e internos de
              operadores, sectores de derivación, catálogo de dispositivos y
              material de apoyo para la gestión con clientes. Aquí encontrarás
              información sobre el equipo, cómo realizar gestiones y mucho más
              para tu desarrollo profesional y personal.
            </p>
          </div>
        </div>

        {/* Robots: en desktop anclados al borde derecho de la pantalla,
            sangrando levemente; en mobile quedan en flujo, debajo del texto */}
        <div className="pointer-events-none relative mx-auto mt-6 flex w-fit items-end sm:absolute sm:bottom-0 sm:right-[-36px] sm:mt-0">
          <div
            className="animar-aparicion relative h-48 w-36 sm:h-[340px] sm:w-64"
            style={{ "--retraso-aparicion": "740ms" } as React.CSSProperties}
          >
            <Image
              src="/images/general/robotVerisure-man.avif"
              alt="Robot Verisure junto a un operador"
              fill
              unoptimized
              className="object-contain object-bottom"
              sizes="(min-width: 640px) 256px, 144px"
            />
          </div>
          <div
            className="animar-aparicion relative -ml-8 h-44 w-32 sm:h-[300px] sm:w-56"
            style={{ "--retraso-aparicion": "870ms" } as React.CSSProperties}
          >
            <Image
              src="/images/general/robotVerisure.avif"
              alt="Robot Verisure"
              fill
              unoptimized
              className="object-contain object-bottom"
              sizes="(min-width: 640px) 224px, 128px"
            />
          </div>
        </div>
      </section>

      {cargando ? (
        <p className="text-corporativo-textoSecundario">
          Cargando información...
        </p>
      ) : errorDeCarga ? (
        <p className="text-corporativo-rojo">
          No se pudo cargar la información. Intentá de nuevo más tarde.
        </p>
      ) : (
        <>
          {/* Avisos: solo si hay cargados */}
          {avisos.length > 0 && (
            <section className="mb-10">
              <h2 className="mb-4 font-titulos text-xl font-bold tracking-tight">
                Avisos
              </h2>
              <div ref={referenciaAvisos} className="space-y-3">
                {avisos.map((aviso, indice) => (
                  <article
                    key={aviso.id}
                    className={`rounded-tarjeta border-l-4 border-corporativo-rojo bg-red-50 p-4 ${
                      avisosVisibles ? "animar-aparicion" : "opacity-0"
                    }`}
                    style={estiloRetrasoEscalonado(indice)}
                  >
                    <div className="flex items-start gap-3">
                      <Megaphone className="mt-0.5 h-5 w-5 shrink-0 text-corporativo-rojo" />
                      <div>
                        <h3 className="font-semibold text-red-950">
                          {aviso.titulo}
                        </h3>
                        <p className="mt-1 whitespace-pre-line text-sm text-neutral-700">
                          {aviso.mensaje}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Operadores */}
          <section className="mb-10">
            <h2 className="mb-4 font-titulos text-xl font-bold tracking-tight">
              Operadores
            </h2>
            {operadores.length === 0 ? (
              <p className="rounded-tarjeta border border-gray-200 bg-white p-6 text-corporativo-textoSecundario">
                No hay operadores cargados todavía.
              </p>
            ) : (
              <div
                ref={referenciaOperadores}
                className="overflow-x-auto rounded-tarjeta border border-gray-200 bg-white shadow-tarjeta"
              >
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-corporativo-textoSecundario">
                      <th className="px-5 py-3 font-semibold">Operador</th>
                      <th className="px-5 py-3 font-semibold">Matrícula</th>
                      <th className="px-5 py-3 font-semibold">Interno</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operadores.map((operador, indice) => (
                      <tr
                        key={operador.id}
                        className={`border-b border-gray-100 transition-colors last:border-b-0 hover:bg-gray-50 ${
                          operadoresVisibles ? "animar-aparicion" : "opacity-0"
                        }`}
                        style={estiloRetrasoEscalonado(indice, 50)}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-corporativo-negro text-xs font-semibold text-white">
                              {obtenerIniciales(operador.nombre_operador)}
                            </span>
                            <span className="font-medium">
                              {operador.nombre_operador}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 font-mono">
                          {operador.matricula}
                        </td>
                        <td className="px-5 py-3">
                          {operador.interno ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Sectores */}
          <section className="mb-10">
            <h2 className="mb-4 font-titulos text-xl font-bold tracking-tight">
              Sectores
            </h2>
            {sectores.length === 0 ? (
              <p className="rounded-tarjeta border border-gray-200 bg-white p-6 text-corporativo-textoSecundario">
                No hay sectores cargados todavía.
              </p>
            ) : (
              <div
                ref={referenciaSectores}
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {sectores.map((sector, indice) => (
                  <article
                    key={sector.id}
                    className={`rounded-tarjeta border border-gray-200 border-l-4 border-l-corporativo-rojo bg-white p-5 ${
                      sectoresVisibles ? "animar-aparicion" : "opacity-0"
                    }`}
                    style={estiloRetrasoEscalonado(indice)}
                  >
                    <h3 className="font-titulos font-bold tracking-tight">
                      {sector.sector}
                    </h3>
                    <p className="mt-1 text-sm text-corporativo-textoSecundario">
                      Interno: {sector.interno ?? "—"}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Accesos rápidos: solo si hay cargados */}
          {accesosRapidos.length > 0 && (
            <nav
              ref={referenciaAccesos}
              aria-label="Accesos rápidos"
              className="flex flex-wrap items-center gap-2 rounded-xl bg-corporativo-negro p-3"
            >
              {accesosRapidos.map((acceso, indice) => (
                <a
                  key={acceso.id}
                  href={acceso.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-corporativo-rojo ${
                    accesosVisibles ? "animar-aparicion" : "opacity-0"
                  }`}
                  style={estiloRetrasoEscalonado(indice, 60)}
                >
                  {acceso.titulo}
                  <ArrowRight className="h-4 w-4" />
                </a>
              ))}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
