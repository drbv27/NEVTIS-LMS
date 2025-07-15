// supabase/functions/delete-community/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORRECCIÓN 1: Definimos los encabezados CORS en una constante para reutilizarlos
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORRECCIÓN 2: Manejador para la solicitud pre-vuelo (preflight) de CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("PROJECT_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!
    );

    const userClient = createClient(
      Deno.env.get("PROJECT_URL")!,
      Deno.env.get("ANON_KEY")!,
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Acceso denegado" }), {
        status: 401,
        headers: corsHeaders,
      });
    }
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "No tienes permisos de administrador" }),
        { status: 403, headers: corsHeaders }
      );
    }

    const { communityId } = await req.json();
    if (!communityId) {
      return new Response(
        JSON.stringify({ error: "Falta el ID de la comunidad" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { data: communityData, error: fetchError } = await supabaseAdmin
      .from("communities")
      .select("image_url")
      .eq("id", communityId)
      .single();

    if (fetchError) throw fetchError;

    if (communityData?.image_url) {
      // Extraemos la ruta del archivo de forma más segura
      const pathSegments = new URL(communityData.image_url).pathname.split("/");
      const filePath = pathSegments
        .slice(pathSegments.indexOf("community-images") + 1)
        .join("/");

      if (filePath) {
        await supabaseAdmin.storage.from("community-images").remove([filePath]);
      }
    }

    const { error: deleteError } = await supabaseAdmin
      .from("communities")
      .delete()
      .eq("id", communityId);

    if (deleteError) throw deleteError;

    // CORRECCIÓN 3: Añadimos los encabezados a la respuesta exitosa
    return new Response(
      JSON.stringify({ message: "Comunidad eliminada con éxito" }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    // CORRECCIÓN 4: Añadimos los encabezados a la respuesta de error
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
