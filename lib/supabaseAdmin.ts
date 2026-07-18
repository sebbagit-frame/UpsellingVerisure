import { createClient } from "@supabase/supabase-js";

// Cliente con la service role key: ignora RLS y tiene permisos de escritura.
// Solo debe importarse desde rutas API del servidor (app/api/admin/*),
// nunca desde componentes de cliente ni exponerse al navegador.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY"
  );
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
