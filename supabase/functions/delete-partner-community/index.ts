// supabase/functions/delete-partner-community/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Crear cliente de Supabase con privilegios de administrador
    const adminClient = createClient(
      Deno.env.get("NEXT_PUBLIC_SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 2. Verificar que quien llama es el partner dueño de la comunidad
    const userClient = createClient(
      Deno.env.get("NEXT_PUBLIC_SUPABASE_URL")!,
      Deno.env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) throw new Error("Access Denied: User not authenticated.");

    const { communityId } = await req.json();
    if (!communityId) throw new Error("Community ID is required.");

    const { data: communityData, error: ownerError } = await adminClient
      .from("communities")
      .select("creator_id, image_url")
      .eq("id", communityId)
      .single();

    if (ownerError)
      throw new Error("Community not found or error fetching owner.");
    if (communityData.creator_id !== user.id) {
      throw new Error(
        "Access Denied: You are not the owner of this community."
      );
    }

    // 3. Obtener todos los cursos de la comunidad para borrar sus imágenes
    const { data: courses, error: coursesError } = await adminClient
      .from("courses")
      .select("id, image_url")
      .eq("community_id", communityId);

    if (coursesError) throw new Error("Could not fetch associated courses.");

    // 4. Borrar imágenes de los cursos (si existen)
    const courseImagePaths = courses
      .map((c) =>
        c.image_url
          ? new URL(c.image_url).pathname.split("/course-images/")[1]
          : null
      )
      .filter(Boolean) as string[];

    if (courseImagePaths.length > 0) {
      await adminClient.storage.from("course-images").remove(courseImagePaths);
    }

    // 5. Borrar imagen de la comunidad (si existe)
    if (communityData.image_url) {
      const communityImagePath = new URL(
        communityData.image_url
      ).pathname.split("/community-images/")[1];
      if (communityImagePath) {
        await adminClient.storage
          .from("community-images")
          .remove([communityImagePath]);
      }
    }

    // 6. Borrar la comunidad de la base de datos
    // La DB se encargará de borrar los cursos y sus dependencias en cascada (ON DELETE CASCADE)
    const { error: deleteError } = await adminClient
      .from("communities")
      .delete()
      .eq("id", communityId);

    if (deleteError) throw deleteError;

    return new Response(
      JSON.stringify({
        message: "Community and all associated content deleted successfully",
      }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 500,
    });
  }
});
