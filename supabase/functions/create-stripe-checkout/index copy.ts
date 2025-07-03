// supabase/functions/create-stripe-checkout/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.12.0?target=deno";

// Inicializamos Stripe con la clave secreta obtenida de las variables de entorno.
// ¡IMPORTANTE! Esta clave NUNCA debe estar en el código del cliente.
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  // La API de Stripe requiere esta configuración cuando se usa en entornos como Deno.
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  // Manejo de la solicitud pre-vuelo (CORS)
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
    // 1. Obtener los datos del cuerpo de la solicitud
    const { priceId, courseId } = await req.json();
    if (!priceId || !courseId) {
      throw new Error("El ID del precio y el ID del curso son requeridos.");
    }

    // 2. Obtener el usuario autenticado que realiza la llamada
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
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      throw new Error("Acceso denegado: Usuario no autenticado.");
    }

    // 3. Crear una Sesión de Checkout en Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      // URLs a las que Stripe redirigirá al usuario después de la compra
      success_url: `${Deno.env.get(
        "SITE_URL"
      )}/courses/${courseId}?purchase=success`,
      cancel_url: `${Deno.env.get("SITE_URL")}/courses/${courseId}`,
      // Guardamos metadatos importantes que usaremos después para la inscripción
      metadata: {
        user_id: user.id,
        course_id: courseId,
      },
    });

    if (!session.url) {
      throw new Error("No se pudo crear la sesión de pago de Stripe.");
    }

    // 4. Devolver la URL de la sesión de checkout al cliente
    return new Response(JSON.stringify({ checkoutUrl: session.url }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: 200,
    });
  } catch (error) {
    // Devolvemos siempre status 200, el error viaja en el JSON
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: 200,
    });
  }
});
