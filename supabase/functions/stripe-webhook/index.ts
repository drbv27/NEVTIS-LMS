// supabase/functions/stripe-webhook/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.12.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  httpClient: Stripe.createFetchHttpClient(),
});

const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  try {
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      stripeWebhookSecret!
    );

    // --- LÓGICA CORREGIDA PARA SUSCRIPCIONES ---
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // La sesión de checkout no tiene los metadatos de la suscripción.
      // Necesitamos obtener el objeto de la suscripción usando su ID.
      const subscriptionId = session.subscription;
      if (!subscriptionId) {
        throw new Error(
          "No se encontró el ID de la suscripción en la sesión de checkout."
        );
      }

      const subscription = await stripe.subscriptions.retrieve(
        subscriptionId as string
      );

      const userId = subscription.metadata.supabase_user_id;
      const communityId = subscription.metadata.community_id;

      if (!userId || !communityId) {
        throw new Error(
          "Faltan metadatos de usuario o comunidad en la suscripción de Stripe."
        );
      }

      const adminClient = createClient(
        Deno.env.get("PROJECT_URL") ?? "",
        Deno.env.get("SERVICE_ROLE_KEY") ?? ""
      );

      // Insertamos en la tabla correcta: community_memberships
      const { error } = await adminClient.from("community_memberships").insert({
        user_id: userId,
        community_id: communityId,
        stripe_subscription_id: subscription.id,
        status: "active", // La suscripción está activa
        current_period_end: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
      });

      if (error) {
        console.error("Error al insertar la membresía:", error);
        throw new Error(
          `Error al crear la membresía en la base de datos: ${error.message}`
        );
      }

      console.log(
        `Usuario ${userId} suscrito exitosamente a la comunidad ${communityId}.`
      );
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error("Error en el webhook de Stripe:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 200 });
  }
});
