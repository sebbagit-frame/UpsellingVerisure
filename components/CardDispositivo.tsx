"use client";

import { ImageOff } from "lucide-react";
import { Dispositivo } from "@/lib/tipos";

interface Props {
  dispositivo: Dispositivo;
  expandido: boolean;
  alAlternar: () => void;
}

export default function CardDispositivo({
  dispositivo,
  expandido,
  alAlternar,
}: Props) {
  return (
    <article
      onClick={alAlternar}
      className={`cursor-pointer overflow-hidden rounded-tarjeta border bg-white transition hover:shadow-tarjeta ${
        expandido
          ? "border-corporativo-negro sm:col-span-2"
          : "border-gray-200"
      }`}
    >
      <div
        className={`flex items-center justify-center ${
          expandido ? "h-[380px] bg-white" : "h-[270px] bg-gray-100"
        }`}
      >
        {dispositivo.imagen_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dispositivo.imagen_url}
            alt={dispositivo.nombre_dispositivo}
            className={`h-full w-full ${
              expandido
                ? "object-contain p-4"
                : "object-cover object-center"
            }`}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-corporativo-textoSecundario">
            <ImageOff className="h-10 w-10" strokeWidth={1.5} />
            <span className="text-sm">Sin imagen</span>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-titulos text-lg font-bold tracking-tight">
            {dispositivo.nombre_dispositivo}
            {dispositivo.nomenclatura && (
              <span className="ml-2 rounded bg-corporativo-negro px-1.5 py-0.5 align-middle font-mono text-xs font-medium text-white">
                {dispositivo.nomenclatura}
              </span>
            )}
          </h2>
        </div>
        {dispositivo.categoria && (
          <p className="mt-1 text-sm text-corporativo-textoSecundario">
            {dispositivo.categoria}
          </p>
        )}

        {expandido && (
          <div className="mt-4 space-y-3 border-t border-gray-200 pt-4 text-sm">
            {dispositivo.caracteristicas && (
              <div>
                <h3 className="mb-1 font-semibold text-gray-800">
                  Características
                </h3>
                <p className="whitespace-pre-line text-gray-600">
                  {dispositivo.caracteristicas}
                </p>
              </div>
            )}
            {dispositivo.descripcion && (
              <div>
                <h3 className="mb-1 font-semibold text-gray-800">
                  Descripción
                </h3>
                <p className="whitespace-pre-line text-gray-600">
                  {dispositivo.descripcion}
                </p>
              </div>
            )}
            {dispositivo.speech && (
              <div className="rounded-md border-l-4 border-corporativo-rojo bg-red-50 p-3">
                <h3 className="mb-1 font-semibold text-red-950">Speech</h3>
                <p className="whitespace-pre-line text-neutral-700">
                  {dispositivo.speech}
                </p>
              </div>
            )}
            {!dispositivo.caracteristicas &&
              !dispositivo.descripcion &&
              !dispositivo.speech && (
              <p className="text-corporativo-textoSecundario">
                Este dispositivo no tiene detalles cargados.
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
