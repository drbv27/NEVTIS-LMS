// supabase/functions/create-user/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface UserData {
  email: string;
  password?: string;
  full_name: string;
  role: "student" | "teacher" | "admin";
}

console.log("Function 'create-user' starting up...");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request (CORS pre-flight)");
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    console.log("--- New Request Received ---");
    const adminClient = createClient(
      Deno.env.get("PROJECT_URL") ?? "",
      Deno.env.get("SERVICE_ROLE_KEY") ?? ""
    );

    const userClient = createClient(
      Deno.env.get("PROJECT_URL") ?? "",
      Deno.env.get("ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    console.log("Step 1: Verifying caller's identity...");
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    if (!user) throw new Error("Acceso denegado: Usuario no autenticado.");
    console.log(`Caller identified: ${user.id}`);

    console.log("Step 2: Verifying caller's admin role...");
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) throw new Error(`Profile error: ${profileError.message}`);
    if (profile.role !== "admin") {
      throw new Error(
        `Acceso denegado: Caller role is '${profile.role}', not 'admin'.`
      );
    }
    console.log("Caller role verified as admin.");

    console.log("Step 3: Parsing new user data from request...");
    const userData: UserData = await req.json();
    console.log(`Data for new user received: ${userData.email}`);

    console.log("Step 4: Creating new user in Supabase Auth...");
    const { data: newUserData, error: createError } =
      await adminClient.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.full_name,
        },
      });

    if (createError) {
      if (createError.message.includes("User already registered")) {
        throw new Error(
          `El correo electrónico '${userData.email}' ya está en uso.`
        );
      }
      throw createError;
    }

    if (!newUserData.user)
      throw new Error("No se pudo crear el usuario en Auth.");
    console.log(`New user created in Auth with ID: ${newUserData.user.id}`);

    console.log("Step 5: Updating role in profiles table...");
    const { error: updateProfileError } = await adminClient
      .from("profiles")
      .update({ role: userData.role })
      .eq("id", newUserData.user.id);

    if (updateProfileError) throw updateProfileError;
    console.log("User role updated successfully.");

    console.log("--- Request Finished Successfully ---");
    return new Response(
      JSON.stringify({
        message: `Usuario ${userData.email} creado con éxito.`,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error("--- ERROR ENCOUNTERED ---");
    console.error(error.message);
    // --- INICIO DE LA CORRECCIÓN: Devolvemos siempre status 200 ---
    // La lógica de error ahora viaja dentro del cuerpo del JSON, no en el status HTTP.
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: 200,
    });
    // --- FIN DE LA CORRECCIÓN ---
  }
});
