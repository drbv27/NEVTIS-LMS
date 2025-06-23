// supabase/functions/delete-user/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Definimos el tipo de datos que esperamos recibir
interface DeletePayload {
  userIdToDelete: string;
}

console.log("Function 'delete-user' starting up...");

serve(async (req) => {
  // Manejo de la solicitud pre-vuelo (CORS)
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
    // Crear un cliente de Supabase con privilegios de administrador
    const adminClient = createClient(
      Deno.env.get("PROJECT_URL") ?? "",
      Deno.env.get("SERVICE_ROLE_KEY") ?? ""
    );

    // Verificar que quien llama es un administrador
    const userClient = createClient(
      Deno.env.get("PROJECT_URL") ?? "",
      Deno.env.get("ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) throw new Error("Acceso denegado: Usuario no autenticado.");

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profileError || profile.role !== "admin") {
      throw new Error("Acceso denegado: No tienes permisos de administrador.");
    }

    // Procesar la eliminación del usuario
    const { userIdToDelete }: DeletePayload = await req.json();
    if (!userIdToDelete) {
      throw new Error("No se proporcionó el ID del usuario a eliminar.");
    }

    // Un administrador no se puede eliminar a sí mismo
    if (userIdToDelete === user.id) {
      throw new Error(
        "Acción no permitida: Un administrador no puede eliminarse a sí mismo."
      );
    }

    // Usamos la API de admin para eliminar al usuario del sistema de autenticación
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(
      userIdToDelete
    );

    if (deleteError) {
      throw new Error(`Error al eliminar el usuario: ${deleteError.message}`);
    }

    // La eliminación en cascada (ON DELETE CASCADE) en la tabla 'profiles'
    // se encargará de borrar el perfil correspondiente.

    return new Response(
      JSON.stringify({ message: `Usuario eliminado con éxito.` }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        status: 200,
      }
    );
  } catch (error) {
    // Devolvemos siempre status 200, el error viaja en el JSON
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: 200,
    });
  }
});
