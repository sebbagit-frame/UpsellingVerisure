"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Detecta cuándo un contenedor entra en el viewport para disparar una
 * animación de aparición escalonada en sus hijos (una sola vez, no se
 * revierte al salir de pantalla).
 *
 * Usa un ref-callback (en vez de useRef) porque varias de estas secciones
 * se montan recién después de que terminan de cargar los datos: con un
 * useRef + efecto de dependencias vacías, el observer se crearía antes de
 * que el nodo exista y nunca se volvería a intentar.
 */
export function useRevelarAlEntrar<T extends HTMLElement>() {
  const [nodo, setNodo] = useState<T | null>(null);
  const [visible, setVisible] = useState(false);

  const referencia = useCallback((elemento: T | null) => {
    setNodo(elemento);
  }, []);

  useEffect(() => {
    if (!nodo) {
      return;
    }

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true);
          observador.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observador.observe(nodo);
    return () => observador.disconnect();
  }, [nodo]);

  return { referencia, visible };
}

/** Estilo inline con el retraso escalonado según la posición del ítem. */
export function estiloRetrasoEscalonado(
  indice: number,
  pasoMs = 80
): React.CSSProperties {
  return { "--retraso-aparicion": `${indice * pasoMs}ms` } as React.CSSProperties;
}
