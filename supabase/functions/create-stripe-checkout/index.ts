// supabase/functions/create-stripe-checkout/index.ts --- VERSIÓN FUNCIONAL RESTAURADA

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.12.0?target=deno";

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
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      httpClient: Stripe.createFetchHttpClient(),
    });

    const { communityId } = await req.json();
    if (!communityId) throw new Error("Community ID is required.");

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

    const adminClient = createClient(
      Deno.env.get("NEXT_PUBLIC_SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: community } = await adminClient
      .from("communities")
      .select("stripe_price_id, slug")
      .eq("id", communityId)
      .single();

    if (!community || !community.stripe_price_id) {
      throw new Error("Community or Price ID not found.");
    }

    const { data: profileData } = await adminClient
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();
    let customerId = profileData?.stripe_customer_id;

    if (customerId) {
      try {
        await stripe.customers.retrieve(customerId);
      } catch (error) {
        customerId = null;
        await adminClient
          .from("profiles")
          .update({ stripe_customer_id: null })
          .eq("id", user.id);
      }
    }

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await adminClient
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: community.stripe_price_id, quantity: 1 }],
      success_url: `${Deno.env.get("SITE_URL")}/community/${
        community.slug
      }?purchase=success`,
      cancel_url: `${Deno.env.get("SITE_URL")}/community/${community.slug}`,
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          community_id: communityId,
        },
      },
    });

    if (!session.url)
      throw new Error("Could not create Stripe checkout session.");

    return new Response(JSON.stringify({ checkoutUrl: session.url }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in create-stripe-checkout:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 500,
    });
  }
});
