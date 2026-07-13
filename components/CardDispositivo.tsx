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
      className={`cursor-pointer overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md ${
        expandido ? "border-gray-400 sm:col-span-2" : "border-gray-200"
      }`}
    >
      <div className="flex h-[270px] items-center justify-center bg-gray-100">
        {dispositivo.imagen_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dispositivo.imagen_url}
            alt={dispositivo.nombre_dispositivo}
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <ImageOff className="h-10 w-10" strokeWidth={1.5} />
            <span className="text-sm">Sin imagen</span>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-semibold">
            {dispositivo.nombre_dispositivo}
            {dispositivo.nomenclatura && (
              <span className="ml-2 rounded bg-gray-800 px-1.5 py-0.5 text-xs font-mono font-medium text-white align-middle">
                {dispositivo.nomenclatura}
              </span>
            )}
          </h2>
        </div>
        {dispositivo.categoria && (
          <p className="mt-1 text-sm text-gray-500">{dispositivo.categoria}</p>
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
            {!dispositivo.caracteristicas && !dispositivo.descripcion && (
              <p className="text-gray-500">
                Este dispositivo no tiene detalles cargados.
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
