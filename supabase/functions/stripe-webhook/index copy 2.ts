// supabase/functions/stripe-webhook/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.12.0?target=deno";

// REVERTIDO: corsHeaders declarado dentro del serve
// const corsHeaders = { ... } (ELIMINADO DE AQUÍ)

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  httpClient: Stripe.createFetchHttpClient(),
});

const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

serve(async (req) => {
  // REVERTIDO: corsHeaders declarado aquí
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  console.log("--- STRIPE WEBHOOK INVOCADO ---");
  console.log("Request Method:", req.method);
  console.log("Request URL:", req.url);

  let rawBody: string;
  try {
    rawBody = await req.text();
    console.log("Raw Body (first 200 chars):", rawBody.substring(0, 200));
  } catch (readError) {
    console.error("Error reading raw body:", readError);
    return new Response(
      JSON.stringify({
        error: `Failed to read raw body: ${readError.message}`,
      }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 400,
      }
    );
  }

  const signature = req.headers.get("Stripe-Signature");
  console.log("Stripe-Signature Header:", signature);
  console.log("Stripe Webhook Secret value is present:", !!stripeWebhookSecret);

  if (!stripeWebhookSecret) {
    const msg = "STRIPE_WEBHOOK_SECRET is not configured as a Deno secret.";
    console.error(msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 500,
    });
  }

  if (!signature) {
    const msg = "Stripe-Signature header missing.";
    console.error(msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 400,
    });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      stripeWebhookSecret
    );
    console.log("Webhook Signature VERIFIED. Event type:", event.type);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new Response(
      JSON.stringify({
        error: `Webhook signature verification failed: ${err.message}`,
      }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 400,
      }
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      console.log("Processing checkout.session.completed event.");
      const session = event.data.object as Stripe.Checkout.Session;

      const subscriptionId = session.subscription;
      if (!subscriptionId) {
        console.error("No subscription ID found in checkout session.");
        throw new Error(
          "No se encontró el ID de la suscripción en la sesión de checkout."
        );
      }

      console.log("Fetching subscription:", subscriptionId);
      const subscription = await stripe.subscriptions.retrieve(
        subscriptionId as string
      );
      console.log("Subscription retrieved. Metadata:", subscription.metadata);

      const userId = subscription.metadata.supabase_user_id;
      const communityId = subscription.metadata.community_id;

      if (!userId || !communityId) {
        console.error(
          "Missing user_id or community_id in subscription metadata."
        );
        throw new Error(
          "Faltan metadatos de usuario o comunidad en la suscripción de Stripe."
        );
      }
      console.log(
        `Attempting to insert membership for User: ${userId}, Community: ${communityId}`
      );

      console.log("Subscription ID to insert:", subscription.id);
      console.log(
        "Current Period End (Unix):",
        subscription.current_period_end
      );
      const currentPeriodEndDate = new Date(
        subscription.current_period_end * 1000
      ).toISOString();
      console.log("Current Period End (ISO String):", currentPeriodEndDate);

      const adminClient = createClient(
        Deno.env.get("PROJECT_URL") ?? "",
        Deno.env.get("SERVICE_ROLE_KEY") ?? ""
      );

      console.log("Admin Client created for DB insertion.");

      const { error: insertError } = await adminClient
        .from("community_memberships")
        .insert({
          user_id: userId,
          community_id: communityId,
          stripe_subscription_id: subscription.id,
          status: "active",
          current_period_end: currentPeriodEndDate,
        });

      if (insertError) {
        console.error(
          "Error al insertar la membresía en la base de datos:",
          insertError
        );
        throw new Error(
          `Error al crear la membresía en la base de datos: ${insertError.message}`
        );
      }

      console.log(
        `Usuario ${userId} suscrito exitosamente a la comunidad ${communityId}.`
      );
    } else {
      console.log(
        `Unhandled Stripe event type: ${event.type}. No action taken.`
      );
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err: any) {
    console.error("Unhandled error in webhook processing logic:", err.message);
    return new Response(
      JSON.stringify({
        error: `Error durante el procesamiento: ${err.message}`,
      }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 500,
      }
    );
  }
});
