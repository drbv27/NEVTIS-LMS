// supabase/functions/create-partner-stripe-account/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.12.0?target=deno";

// Headers CORS para permitir la comunicación desde el frontend
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  // Manejador para la solicitud pre-vuelo (preflight) de CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Verificar la autenticación del usuario
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

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Acceso denegado: Usuario no autenticado." }),
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // 2. Verificar que el usuario sea un 'partner'
    const adminClient = createClient(
      // Usamos adminClient para leer roles de perfiles
      Deno.env.get("PROJECT_URL") ?? "",
      Deno.env.get("SERVICE_ROLE_KEY") ?? ""
    );

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("role, stripe_account_id") // Obtenemos el role y el stripe_account_id existente
      .eq("id", user.id)
      .single();

    if (profileError || profile.role !== "partner") {
      return new Response(
        JSON.stringify({
          error: "Acceso denegado: Se requieren permisos de partner.",
        }),
        { status: 403, headers: corsHeaders }
      );
    }

    let accountId = profile.stripe_account_id;

    // 3. Crear o verificar la cuenta de Stripe Connect Custom Account
    if (!accountId) {
      // Si el partner no tiene un stripe_account_id, creamos una nueva cuenta Custom.
      const account = await stripe.accounts.create({
        type: "custom",
        country: "US", // O el país predeterminado de tu plataforma
        email: user.email!,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual", // Esto puede ser configurable si tu plataforma permite empresas
        metadata: {
          supabase_user_id: user.id,
        },
      });
      accountId = account.id;

      // Guardar el nuevo accountId en la tabla profiles
      await adminClient
        .from("profiles")
        .update({ stripe_account_id: accountId })
        .eq("id", user.id);
    }

    // 4. Crear un Account Link para el onboarding del partner
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${Deno.env.get("SITE_URL")}/partner/stripe-settings`, // Redirección si el link expira o hay error
      return_url: `${Deno.env.get("SITE_URL")}/partner/stripe-settings`, // Redirección al completar
      type: "account_onboarding",
      collect: "eventually_due", // Recopila información para cumplir con los requisitos de Stripe
    });

    // 5. Devolver la URL del Account Link
    return new Response(JSON.stringify({ onboardingUrl: accountLink.url }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating Stripe Connect account link:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 500,
    });
  }
});
