import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr"; // Mantenemos el import

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const cookieStore = cookies();
    // --- INICIO DE LA CORRECCIÓN ---
    // Esta es la forma moderna que elimina la advertencia.
    // En lugar de construir un objeto con get/set/remove manualmente,
    // pasamos la función que devuelve el cookieStore directamente.
    // La librería se encarga del resto.
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => {
            return cookieStore.getAll();
          },
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                cookieStore.set(name, value, options);
              } catch (error) {
                // Ignorar el error si las cabeceras ya se enviaron.
              }
            });
          },
        },
      }
    );
    // --- FIN DE LA CORRECCIÓN ---

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  console.error("OAuth callback error:", "Código no encontrado o inválido.");
  return NextResponse.redirect(
    `${origin}/login?error=Ocurrió un error durante la autenticación.`
  );
}
