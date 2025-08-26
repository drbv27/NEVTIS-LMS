// supabase/functions/stripe-webhook/index.ts --- VERSIÓN FUNCIONAL RESTAURADA

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.12.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  httpClient: Stripe.createFetchHttpClient(),
});
const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const body = await req.text();

  try {
    if (!signature || !stripeWebhookSecret)
      throw new Error("Missing Stripe signature or webhook secret.");

    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      stripeWebhookSecret
    );

    // EL EVENTO CORRECTO PARA SUSCRIPCIONES
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription;

      if (typeof subscriptionId !== "string")
        throw new Error("Subscription ID not found.");

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      const userId = subscription.metadata.supabase_user_id;
      const communityId = subscription.metadata.community_id;

      if (!userId || !communityId)
        throw new Error(`Missing metadata in subscription ${subscriptionId}`);

      const adminClient = createClient(
        Deno.env.get("NEXT_PUBLIC_SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const { error: upsertError } = await adminClient
        .from("community_memberships")
        .upsert(
          {
            user_id: userId,
            community_id: communityId,
            stripe_subscription_id: subscription.id,
            status: "active",
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
          },
          { onConflict: "user_id, community_id" }
        );

      if (upsertError)
        throw new Error(`Supabase DB error: ${upsertError.message}`);
    }
  } catch (err) {
    console.error("Webhook handler error:", err.message);
    return new Response(err.message, { status: 400 });
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
