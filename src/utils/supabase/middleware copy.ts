// src/utils/supabase/middleware.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: La documentación oficial incluye aquí una llamada a supabase.auth.getUser()
  // para refrescar la sesión.
  await supabase.auth.getUser();

  // NOTA: He omitido intencionadamente el bloque que redirige al usuario a /login
  // para no mezclar la lógica de refresco de sesión con la de protección de rutas.
  // Haremos un solo cambio a la vez.

  return supabaseResponse;
}
