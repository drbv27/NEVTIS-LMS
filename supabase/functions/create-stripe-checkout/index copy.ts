// supabase/functions/create-stripe-checkout/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.12.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  httpClient: Stripe.createFetchHttpClient(),
});

const getOrCreateStripeCustomer = async (userId: string, email: string) => {
  const adminClient = createClient(
    Deno.env.get("PROJECT_URL") ?? "",
    Deno.env.get("SERVICE_ROLE_KEY") ?? ""
  );

  const { data: profileData } = await adminClient
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .single();

  if (profileData?.stripe_customer_id) {
    return profileData.stripe_customer_id;
  }

  const customer = await stripe.customers.create({
    email: email,
    metadata: { supabase_user_id: userId },
  });

  await adminClient
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", userId);

  return customer.id;
};

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
    const { communityId } = await req.json();
    if (!communityId) throw new Error("El ID de la comunidad es requerido.");

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

    const adminClient = createClient(
      Deno.env.get("PROJECT_URL") ?? "",
      Deno.env.get("SERVICE_ROLE_KEY") ?? ""
    );

    // --- INICIO DE LA CORRECCIÓN ---
    // 1. Ahora pedimos tanto el price_id como el slug
    const { data: communityData, error: communityError } = await adminClient
      .from("communities")
      .select("stripe_price_id, slug")
      .eq("id", communityId)
      .single();

    if (
      communityError ||
      !communityData ||
      !communityData.stripe_price_id ||
      !communityData.slug
    ) {
      throw new Error(
        "Esta comunidad no tiene una suscripción o un slug configurado."
      );
    }

    const priceId = communityData.stripe_price_id;
    const communitySlug = communityData.slug; // Guardamos el slug
    // --- FIN DE LA CORRECCIÓN ---

    const customerId = await getOrCreateStripeCustomer(user.id, user.email!);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      // 2. Usamos el communitySlug para construir las URLs correctas
      success_url: `${Deno.env.get(
        "SITE_URL"
      )}/community/${communitySlug}?purchase=success`,
      cancel_url: `${Deno.env.get("SITE_URL")}/community/${communitySlug}`,
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          community_id: communityId,
        },
      },
    });

    if (!session.url)
      throw new Error("No se pudo crear la sesión de pago de Stripe.");

    return new Response(JSON.stringify({ checkoutUrl: session.url }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: 200,
    });
  }
});
