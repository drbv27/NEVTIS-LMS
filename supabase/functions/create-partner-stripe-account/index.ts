// supabase/functions/create-partner-stripe-account/index.ts

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

    const userClient = createClient(
      Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "",
      Deno.env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") ?? "",
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
      throw new Error("Access Denied: User not authenticated.");
    }

    const adminClient = createClient(
      Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("role, stripe_account_id")
      .eq("id", user.id)
      .single();

    if (
      profileError ||
      (profile.role !== "partner" && profile.role !== "admin")
    ) {
      throw new Error("Access Denied: Partner permissions required.");
    }

    let accountId = profile.stripe_account_id;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: user.email!,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual",
        metadata: {
          supabase_user_id: user.id,
        },
      });
      accountId = account.id;

      await adminClient
        .from("profiles")
        .update({ stripe_account_id: accountId })
        .eq("id", user.id);
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${Deno.env.get(
        "SITE_URL"
      )}/partner/stripe-settings?refresh=true`,
      return_url: `${Deno.env.get(
        "SITE_URL"
      )}/partner/stripe-settings?return=true`,
      type: "account_onboarding",
    });

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
