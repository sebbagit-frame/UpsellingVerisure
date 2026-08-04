"use client";

import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Operador, RolOperador } from "@/lib/tipos";
import {
  estiloRetrasoEscalonado,
  useRevelarAlEntrar,
} from "@/lib/hooks/useRevelarAlEntrar";

/** Orden de aparición de las secciones, de arriba hacia abajo. */
const ROLES_EN_ORDEN: { rol: RolOperador; titulo: string }[] = [
  { rol: "Supervisor", titulo: "Supervisor" },
  { rol: "Coordinador", titulo: "Coordinador" },
  { rol: "Mentor", titulo: "Mentores/as" },
  { rol: "Operador", titulo: "Operadores" },
];

function TarjetaOperador({
  operador,
  visible,
  indice,
}: {
  operador: Operador;
  visible: boolean;
  indice: number;
}) {
  return (
    <article
      className={`overflow-hidden rounded-tarjeta border border-gray-200 bg-white shadow-tarjeta ${
        visible ? "animar-aparicion" : "opacity-0"
      }`}
      style={estiloRetrasoEscalonado(indice)}
    >
      <div className="flex h-48 items-center justify-center bg-gray-100">
        {operador.foto_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={operador.foto_url}
            alt={operador.nombre_operador}
            className="h-full w-full object-cover"
          />
        ) : (
          <UserRound className="h-16 w-16 text-gray-300" strokeWidth={1.25} />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-titulos font-bold tracking-tight">
          {operador.nombre_operador}
        </h3>
        <p className="mt-1 text-sm text-corporativo-textoSecundario">
          Matrícula: <span className="font-mono">{operador.matricula}</span>
        </p>
        <p className="mt-0.5 text-sm text-corporativo-textoSecundario">
          Interno: {operador.interno ?? "—"}
        </p>
      </div>
    </article>
  );
}

function SeccionRol({
  titulo,
  operadores,
}: {
  titulo: string;
  operadores: Operador[];
}) {
  const { referencia, visible } = useRevelarAlEntrar<HTMLDivElement>();

  return (
    <section className="mb-10">
      <h2 className="mb-4 font-titulos text-xl font-bold tracking-tight">
        {titulo}
      </h2>
      <div ref={referencia} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {operadores.map((operador, indice) => (
          <TarjetaOperador
            key={operador.id}
            operador={operador}
            visible={visible}
            indice={indice}
          />
        ))}
      </div>
    </section>
  );
}

export default function NosotrosPage() {
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorDeCarga, setErrorDeCarga] = useState(false);

  useEffect(() => {
    let componenteActivo = true;

    async function cargarOperadores() {
      const { data, error } = await supabase
        .from("operadores")
        .select("id, nombre_operador, matricula, interno, foto_url, rol")
        .order("nombre_operador");

      if (!componenteActivo) {
        return;
      }
      if (error) {
        setErrorDeCarga(true);
      } else {
        setOperadores((data ?? []) as Operador[]);
      }
      setCargando(false);
    }

    cargarOperadores();
    return () => {
      componenteActivo = false;
    };
  }, []);

  return (
    <div>
      <h1 className="mb-1 font-titulos text-3xl font-bold tracking-tight">
        Nosotros
      </h1>
      <p className="mb-8 text-sm text-corporativo-textoSecundario">
        El equipo de operadores del sector.
      </p>

      {cargando ? (
        <p className="text-corporativo-textoSecundario">
          Cargando información...
        </p>
      ) : errorDeCarga ? (
        <p className="text-corporativo-rojo">
          No se pudo cargar la información. Intentá de nuevo más tarde.
        </p>
      ) : operadores.length === 0 ? (
        <p className="rounded-tarjeta border border-gray-200 bg-white p-6 text-corporativo-textoSecundario">
          No hay operadores cargados todavía.
        </p>
      ) : (
        ROLES_EN_ORDEN.map(({ rol, titulo }) => {
          const operadoresDelRol = operadores.filter(
            (operador) => operador.rol === rol
          );
          if (operadoresDelRol.length === 0) {
            return null;
          }
          return (
            <SeccionRol
              key={rol}
              titulo={titulo}
              operadores={operadoresDelRol}
            />
          );
        })
      )}
    </div>
  );
}
