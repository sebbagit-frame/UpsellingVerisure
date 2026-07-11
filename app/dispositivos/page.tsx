import { supabase } from "@/lib/supabase";
import { Dispositivo } from "@/lib/tipos";
import CatalogoDispositivos from "@/components/CatalogoDispositivos";

// Los dispositivos se administran desde Supabase: consultar siempre datos frescos
export const dynamic = "force-dynamic";

export default async function DispositivosPage() {
  const { data, error } = await supabase
    .from("dispositivos")
    .select(
      "id, nombre_dispositivo, nomenclatura, imagen_url, categoria, caracteristicas, descripcion, sistema"
    )
    .order("nombre_dispositivo");

  if (error) {
    return (
      <div>
        <h1 className="mb-4 text-3xl font-bold">Dispositivos</h1>
        <p className="text-red-600">
          No se pudieron cargar los dispositivos. Intentá de nuevo más tarde.
        </p>
      </div>
    );
  }

  const dispositivos = (data ?? []) as Dispositivo[];

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Dispositivos</h1>
      <CatalogoDispositivos dispositivos={dispositivos} />
    </div>
  );
}
