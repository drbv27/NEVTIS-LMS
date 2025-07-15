// supabase/functions/create-user/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { email, password, full_name, role } = await req.json();

    // Conectarse a Supabase con el rol de servicio para tener permisos de administrador
    const supabaseAdmin = createClient(
      Deno.env.get("PROJECT_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!
    );

    // 1. Crear el usuario en el sistema de autenticación
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          // CORRECCIÓN 2: Usamos 'full_name' aquí también.
          full_name: full_name,
        },
      });

    if (authError) {
      console.error("Error creating auth user:", authError.message);
      throw new Error(`Error de autenticación: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error(
        "No se pudo crear el usuario en el sistema de autenticación."
      );
    }

    const newUserId = authData.user.id;

    // 2. CORRECCIÓN: Insertar manualmente el perfil en la tabla 'profiles'
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: newUserId,
        full_name: full_name,
        role: role,
      });

    if (profileError) {
      console.error("Error creating profile:", profileError.message);
      // Opcional: Si la creación del perfil falla, podríamos intentar borrar el usuario de auth
      // para evitar un estado inconsistente.
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      throw new Error(`Error al crear el perfil: ${profileError.message}`);
    }

    return new Response(
      JSON.stringify({ message: "Usuario creado exitosamente" }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: 400,
    });
  }
});
