"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  FileType,
  Link as IconoEnlace,
  LucideIcon,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { CategoriaRecurso, Recurso, TipoRecurso } from "@/lib/tipos";
import {
  estiloRetrasoEscalonado,
  useRevelarAlEntrar,
} from "@/lib/hooks/useRevelarAlEntrar";

const CATEGORIAS: {
  valor: CategoriaRecurso;
  titulo: string;
  descripcion: string;
  Icono: LucideIcon;
}[] = [
  {
    valor: "usos_basicos",
    titulo: "Guías de usos básicos",
    descripcion:
      "Manuales y material de consulta sobre el uso cotidiano del sistema de alarma y sus dispositivos.",
    Icono: BookOpen,
  },
  {
    valor: "upselling",
    titulo: "Guías de Upselling",
    descripcion:
      "Material de apoyo para ofrecer ampliaciones y nuevos dispositivos a clientes ya activos.",
    Icono: TrendingUp,
  },
];

const ETIQUETAS_CATEGORIA: Record<CategoriaRecurso, string> = {
  usos_basicos: "Usos básicos",
  upselling: "Upselling",
};

const ETIQUETAS_POR_TIPO: Record<TipoRecurso, string> = {
  pdf: "PDF",
  excel: "Excel",
  word: "Word",
  enlace: "Enlace",
};

const FILTROS: ("Todos" | TipoRecurso)[] = [
  "Todos",
  "pdf",
  "excel",
  "word",
  "enlace",
];

const ICONOS_POR_TIPO: Record<TipoRecurso, LucideIcon> = {
  pdf: FileText,
  excel: FileSpreadsheet,
  word: FileType,
  enlace: IconoEnlace,
};

function formatearFecha(fechaIso: string): string {
  const fecha = new Date(fechaIso);
  return Number.isNaN(fecha.getTime())
    ? ""
    : fecha.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
}

export default function ListaInstructivos() {
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorDeCarga, setErrorDeCarga] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"Todos" | TipoRecurso>("Todos");
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<CategoriaRecurso | null>(null);

  const { referencia: referenciaLista, visible: listaVisible } =
    useRevelarAlEntrar<HTMLDivElement>();

  // Los datos se consultan al montar el componente: cada visita trae la
  // lista fresca, sin cachés intermedios (mismo criterio que el catálogo)
  useEffect(() => {
    let componenteActivo = true;

    async function cargarRecursos() {
      const { data, error } = await supabase
        .from("recursos")
        .select(
          "id, titulo, tipo, categoria, archivo_url, enlace_externo, dispositivo_id, fecha_subida, dispositivos(nombre_dispositivo)"
        )
        .order("fecha_subida", { ascending: false });

      if (!componenteActivo) {
        return;
      }
      if (error) {
        setErrorDeCarga(true);
      } else {
        setRecursos((data ?? []) as unknown as Recurso[]);
      }
      setCargando(false);
    }

    cargarRecursos();
    return () => {
      componenteActivo = false;
    };
  }, []);

  const recursosDeCategoria = useMemo(
    () =>
      recursos.filter(
        (recurso) => recurso.categoria === categoriaSeleccionada
      ),
    [recursos, categoriaSeleccionada]
  );

  const recursosFiltrados = useMemo(() => {
    const termino = terminoBusqueda.trim().toLowerCase();
    return recursosDeCategoria.filter((recurso) => {
      const coincideTipo = filtroTipo === "Todos" || recurso.tipo === filtroTipo;
      const coincideBusqueda =
        !termino || recurso.titulo.toLowerCase().includes(termino);
      return coincideTipo && coincideBusqueda;
    });
  }, [recursosDeCategoria, terminoBusqueda, filtroTipo]);

  function seleccionarCategoria(categoria: CategoriaRecurso) {
    setCategoriaSeleccionada(categoria);
    setTerminoBusqueda("");
    setFiltroTipo("Todos");
  }

  function volverAlSelector() {
    setCategoriaSeleccionada(null);
    setTerminoBusqueda("");
    setFiltroTipo("Todos");
  }

  if (cargando) {
    return <p className="text-corporativo-textoSecundario">Cargando recursos...</p>;
  }

  if (errorDeCarga) {
    return (
      <p className="text-corporativo-rojo">
        No se pudieron cargar los recursos. Intentá de nuevo más tarde.
      </p>
    );
  }

  // Vista inicial: selector de categoría, centrado en la altura disponible
  if (!categoriaSeleccionada) {
    return (
      <div className="flex min-h-[55vh] flex-col justify-center">
        <p className="mb-5 font-titulos text-lg font-bold tracking-tight">
          ¿Qué guías estás buscando?
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          {CATEGORIAS.map((categoria, indice) => {
            const esUsosBasicos = categoria.valor === "usos_basicos";
            return (
              <button
                key={categoria.valor}
                type="button"
                onClick={() => seleccionarCategoria(categoria.valor)}
                className={`group animar-aparicion rounded-tarjeta border border-gray-200 border-l-4 p-10 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${
                  esUsosBasicos
                    ? "border-l-corporativo-negro bg-neutral-100/80 hover:border-corporativo-negro"
                    : "border-l-corporativo-rojo bg-red-50/60 hover:border-corporativo-rojo"
                }`}
                style={estiloRetrasoEscalonado(indice, 140)}
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-lg text-white ${
                    esUsosBasicos
                      ? "bg-corporativo-negro"
                      : "bg-corporativo-rojo"
                  }`}
                >
                  <categoria.Icono className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <span className="mt-5 block font-titulos text-2xl font-bold tracking-tight text-corporativo-negro sm:text-3xl">
                  {categoria.titulo}
                </span>
                <span className="mt-2 block text-sm leading-relaxed text-corporativo-textoSecundario">
                  {categoria.descripcion}
                </span>
                <span className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-corporativo-rojo">
                  ¡Vamos!
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Vista de categoría elegida: buscador + filtro + listado
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={volverAlSelector}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-corporativo-negro hover:text-corporativo-negro"
        >
          ← Cambiar de categoría
        </button>
        <span
          className={`rounded-full px-3.5 py-1 font-titulos text-sm font-bold tracking-tight text-white ${
            categoriaSeleccionada === "usos_basicos"
              ? "bg-corporativo-negro"
              : "bg-corporativo-rojo"
          }`}
        >
          {ETIQUETAS_CATEGORIA[categoriaSeleccionada]}
        </span>
      </div>

      {recursosDeCategoria.length === 0 ? (
        <p className="rounded-tarjeta border border-gray-200 bg-white p-6 text-corporativo-textoSecundario">
          No hay recursos cargados todavía en esta categoría.
        </p>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <input
              type="search"
              value={terminoBusqueda}
              onChange={(evento) => setTerminoBusqueda(evento.target.value)}
              placeholder="Buscar por título..."
              className="w-full max-w-md rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm transition-colors focus:border-corporativo-negro focus:outline-none"
            />
            <div className="flex flex-wrap gap-2">
              {FILTROS.map((filtro) => (
                <button
                  key={filtro}
                  type="button"
                  onClick={() => setFiltroTipo(filtro)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    filtroTipo === filtro
                      ? "bg-corporativo-negro text-white"
                      : "border border-gray-300 bg-white text-gray-700 hover:border-corporativo-negro hover:text-corporativo-negro"
                  }`}
                >
                  {filtro === "Todos" ? "Todos" : ETIQUETAS_POR_TIPO[filtro]}
                </button>
              ))}
            </div>
          </div>

          {recursosFiltrados.length === 0 ? (
            <p className="rounded-tarjeta border border-gray-200 bg-white p-6 text-corporativo-textoSecundario">
              No se encontraron recursos con ese criterio de búsqueda.
            </p>
          ) : (
            <div ref={referenciaLista} className="space-y-3">
              {recursosFiltrados.map((recurso, indice) => {
                const Icono = ICONOS_POR_TIPO[recurso.tipo] ?? FileText;
                const urlDestino =
                  recurso.archivo_url ?? recurso.enlace_externo;
                const fecha = formatearFecha(recurso.fecha_subida);
                return (
                  <article
                    key={recurso.id}
                    className={`flex items-center gap-4 rounded-tarjeta border border-gray-200 bg-white p-4 transition-shadow hover:shadow-tarjeta ${
                      listaVisible ? "animar-aparicion" : "opacity-0"
                    }`}
                    style={estiloRetrasoEscalonado(indice, 60)}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-corporativo-negro text-white">
                      <Icono className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate font-titulos font-bold tracking-tight">
                        {recurso.titulo}
                      </h2>
                      <p className="mt-0.5 text-sm text-corporativo-textoSecundario">
                        {ETIQUETAS_POR_TIPO[recurso.tipo] ?? recurso.tipo}
                        {recurso.dispositivos?.nombre_dispositivo &&
                          ` · ${recurso.dispositivos.nombre_dispositivo}`}
                        {fecha && ` · ${fecha}`}
                      </p>
                    </div>
                    {urlDestino && (
                      <a
                        href={urlDestino}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex shrink-0 items-center gap-1.5 rounded-lg bg-corporativo-rojo px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                      >
                        Abrir
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
