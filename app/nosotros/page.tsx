"use client";

import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Operador, RolOperador } from "@/lib/tipos";
import {
  estiloRetrasoEscalonado,
  useRevelarAlEntrar,
} from "@/lib/hooks/useRevelarAlEntrar";

/** Bloques de presentación del sector, arriba de todo en la página. */
const BLOQUES_PRESENTACION: { titulo: string; texto: string }[] = [
  {
    titulo: "Cuál es nuestro rol",
    texto:
      "Somos el motor de expansión dentro de Verisure. Nuestro trabajo empieza cuando el cliente ya confía en la empresa: nos encargamos de entender sus necesidades actuales y ofrecerle la ampliación de dispositivos exacta para maximizar su tranquilidad.",
  },
  {
    titulo: "Cómo trabajamos",
    texto:
      "Creemos en la competencia, pero 100% sana. Nos empujamos mutuamente a superar los objetivos, entendiendo que el éxito de uno levanta la vara de todos. Somos un equipo muy unido, donde la presión natural por llegar a la meta siempre se equilibra con el compañerismo y el buen clima.",
  },
  {
    titulo: "Nuestros rituales",
    texto:
      "En este sector, los logros no pasan desapercibidos. Cada venta se festeja con aplausos en el momento, porque sabemos el esfuerzo que hay detrás de cada 'sí'. Y como sabemos que no todo es trabajo, tenemos una regla inquebrantable: después de cada cierre, las métricas quedan en la oficina y salimos todos juntos a tomar algo para celebrar el esfuerzo del equipo.",
  },
];

/** Orden de aparición de las secciones, de arriba hacia abajo. */
const ROLES_EN_ORDEN: { rol: RolOperador; titulo: string }[] = [
  { rol: "Supervisor", titulo: "Supervisor" },
  { rol: "Coordinador", titulo: "Coordinador" },
  { rol: "Mentor", titulo: "Mentores/as" },
  { rol: "BO", titulo: "BO (Back Office)" },
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
      {/* Presentación del sector: introducción a toda la página */}
      <section className="mb-12 grid gap-8 lg:grid-cols-3 lg:gap-0 lg:divide-x lg:divide-gray-200">
        {BLOQUES_PRESENTACION.map(({ titulo, texto }, indice) => (
          <div
            key={titulo}
            className="animar-aparicion lg:px-7 lg:first:pl-0 lg:last:pr-0"
            style={estiloRetrasoEscalonado(indice, 130)}
          >
            <h2 className="font-titulos text-lg font-bold tracking-tight">
              {titulo}
            </h2>
            <p className="mt-2.5 leading-relaxed text-corporativo-textoSecundario">
              {texto}
            </p>
          </div>
        ))}
      </section>

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
