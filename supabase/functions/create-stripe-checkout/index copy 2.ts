// supabase/functions/create-stripe-checkout/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.12.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  httpClient: Stripe.createFetchHttpClient(),
});

const PLATFORM_COMMISSION_PERCENTAGE = 0.05;

const getOrCreateStripeCustomer = async (userId: string, email: string) => {
  try {
    const customers = await stripe.customers.list({ email: email, limit: 1 });
    if (customers.data.length > 0) {
      console.log(
        `[DEBUG] Found existing test customer: ${customers.data[0].id}`
      );
      return customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: email,
        metadata: { supabase_user_id: userId },
      });
      console.log(
        `[DEBUG] Successfully created new test customer: ${customer.id}`
      );
      return customer.id;
    }
  } catch (e: any) {
    if (
      e.code === "resource_already_exists" ||
      (e.statusCode === 400 && e.message.includes("already exists"))
    ) {
      console.warn(
        `[DEBUG] Customer for email ${email} already exists in test mode. Attempting to find existing.`
      );
      const customers = await stripe.customers.list({ email: email, limit: 1 });
      if (customers.data.length > 0) {
        console.log(
          `[DEBUG] Found existing test customer: ${customers.data[0].id}`
        );
        return customers.data[0].id;
      }
    }
    console.error(
      `[DEBUG] Unexpected error in getOrCreateStripeCustomer: ${e.message}`,
      e
    );
    throw new Error(`Error al obtener o crear cliente Stripe: ${e.message}`);
  }
};

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
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

    console.log("--- CREATE STRIPE CHECKOUT INVOCADO ---");
    console.log("Community ID:", communityId);

    const { data: communityData, error: communityError } = await adminClient
      .from("communities")
      .select(
        `stripe_price_id, slug, creator_id, profiles!communities_creator_id_fkey(stripe_account_id)`
      )
      .eq("id", communityId)
      .single();

    if (communityError) {
      console.error("DB Error fetching community data:", communityError);
      throw new Error(
        `Error al obtener datos de la comunidad: ${communityError.message}`
      );
    }
    if (
      !communityData ||
      !communityData.stripe_price_id ||
      !communityData.slug
    ) {
      console.error(
        "Missing community data or Stripe Price ID/Slug:",
        communityData
      );
      throw new Error(
        "Esta comunidad no tiene una suscripción o un slug configurado, o no se pudo obtener el creador."
      );
    }

    const priceId = communityData.stripe_price_id;
    const communitySlug = communityData.slug;
    const communityCreatorId = communityData.creator_id;

    console.log("Price ID from DB:", priceId);
    console.log("Community Creator ID:", communityCreatorId);

    let partnerStripeAccountId: string | null = null;
    if (communityData.profiles) {
      if (Array.isArray(communityData.profiles)) {
        partnerStripeAccountId =
          communityData.profiles.length > 0
            ? communityData.profiles[0].stripe_account_id
            : null;
      } else {
        partnerStripeAccountId = communityData.profiles.stripe_account_id;
      }
    }
    console.log(
      "Partner Stripe Account ID from profile:",
      partnerStripeAccountId
    );

    let customerIdForSession: string | null = null;
    let applicationFeeAmountForSession: number = 0;

    let stripeClientToUse = stripe;

    if (!communityCreatorId || !partnerStripeAccountId) {
      // Comunidades del jefe
      customerIdForSession = await getOrCreateStripeCustomer(
        user.id,
        user.email!
      );
      console.log(
        "Customer ID for Platform-owned community:",
        customerIdForSession
      );
      console.log(
        "Community is owned by Platform. Standard payment flow (no commission/transfer)."
      );
      applicationFeeAmountForSession = 0; // No comisión para el jefe
    } else {
      // Comunidades del partner
      console.log(
        "Community is owned by Partner. Setting up connected account payment."
      );

      // === INICIALIZACIÓN Y DEPURACIÓN DE CLIENTE STRIPE PARA PRECIOS ===
      // Aquí creamos una nueva instancia de Stripe *solo para esta llamada* con el stripeAccount del partner.
      // Esto descarta cualquier problema de ámbito con 'stripeClientToUse' o 'finalStripeClient'.
      const temporaryPartnerStripeClient = new Stripe(
        Deno.env.get("STRIPE_SECRET_KEY") ?? "",
        {
          apiVersion: "2025-06-30", // Tu versión de API
          stripeAccount: partnerStripeAccountId!, // Usamos '!' porque sabemos que en este bloque existe
          httpClient: Stripe.createFetchHttpClient(),
        }
      );
      console.log(
        `[DEBUG - prices.retrieve] Using temporary Stripe client with stripeAccount: ${partnerStripeAccountId} for price retrieve.`
      );

      const priceObject = await temporaryPartnerStripeClient.prices.retrieve(
        priceId
      ); // <--- Usamos el cliente TEMPORAL aquí
      // === FIN INICIALIZACIÓN Y DEPURACIÓN ===

      if (!priceObject || priceObject.unit_amount === null) {
        console.error(
          "Error retrieving price object for commission calculation:",
          priceObject
        );
        throw new Error(
          "No se pudo obtener el precio del producto para calcular la comisión."
        );
      }

      const totalAmount = priceObject.unit_amount;
      applicationFeeAmountForSession = Math.round(
        totalAmount * PLATFORM_COMMISSION_PERCENTAGE
      );
      console.log(
        `Calculated Application Fee: ${
          applicationFeeAmountForSession / 100
        } (from total ${totalAmount / 100})`
      );
    }

    let sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${Deno.env.get(
        "SITE_URL"
      )}/community/${communitySlug}?purchase=success`,
      cancel_url: `${Deno.env.get("SITE_URL")}/community/${communitySlug}`,
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          community_id: communityId,
        },
        ...(applicationFeeAmountForSession > 0 && {
          application_fee_amount: applicationFeeAmountForSession,
        }),
      },
    };

    if (customerIdForSession) {
      sessionParams.customer = customerIdForSession;
    }

    // === DEPURACIÓN DE finalStripeClient ===
    console.log(
      `[DEBUG - Checkout Session Creation] Initializing final Stripe client for session creation.`
    );
    if (communityCreatorId && partnerStripeAccountId) {
      // Si es una comunidad del partner, creamos un cliente para la sesión con stripeAccount
      stripeClientToUse = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
        apiVersion: "2025-06-30", // Tu versión de API
        stripeAccount: partnerStripeAccountId, // Operación en la cuenta del partner
        httpClient: Stripe.createFetchHttpClient(),
      });
      console.log(
        `[DEBUG - Checkout Session Creation] Using Stripe client with stripeAccount: ${partnerStripeAccountId}.`
      );
    } else {
      // Si es una comunidad del jefe, usamos el cliente 'stripe' principal (sin stripeAccount)
      stripeClientToUse = stripe; // Ya inicializado globalmente
      console.log(
        `[DEBUG - Checkout Session Creation] Using platform's main Stripe client.`
      );
    }
    // === FIN DEPURACIÓN ===

    const session = await stripeClientToUse.checkout.sessions.create(
      sessionParams
    );

    if (!session.url)
      throw new Error("No se pudo crear la sesión de pago de Stripe.");

    console.log("Stripe Checkout Session created successfully:", session.url);
    return new Response(JSON.stringify({ checkoutUrl: session.url }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: 200,
    });
  } catch (error: any) {
    console.error(
      "Unhandled error in create-stripe-checkout:",
      error.message,
      error.stack
    );
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: error.statusCode || 500,
    });
  }
});
