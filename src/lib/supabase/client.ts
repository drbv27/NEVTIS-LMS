//src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

// No vamos a exportar una constante, sino una función que crea el cliente.
// Este es el patrón correcto y el que usabas antes.
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
