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

    // --- INICIO DE LA CORRECCIÓN FINAL ---
    // Cambiamos a la versión asíncrona para la verificación del evento
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      stripeWebhookSecret!
    );
    // --- FIN DE LA CORRECCIÓN FINAL ---

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      if (session.payment_status === "paid") {
        const userId = session.metadata?.user_id;
        const courseId = session.metadata?.course_id;

        if (!userId || !courseId) {
          throw new Error(
            "Faltan metadatos de usuario o curso en la sesión de Stripe."
          );
        }

        const adminClient = createClient(
          Deno.env.get("PROJECT_URL") ?? "",
          Deno.env.get("SERVICE_ROLE_KEY") ?? ""
        );

        const { error } = await adminClient.from("enrollments").insert({
          student_id: userId,
          course_id: courseId,
        });

        if (error) {
          // Si el error es por una clave única duplicada, significa que el usuario ya está inscrito.
          // Lo manejamos como un caso de éxito para que Stripe no siga reintentando.
          if (
            error.message.includes(
              "duplicate key value violates unique constraint"
            )
          ) {
            console.warn(
              `Intento de inscripción duplicada para el usuario ${userId} en el curso ${courseId}. Ya estaba inscrito.`
            );
          } else {
            throw new Error(`Error al inscribir al usuario: ${error.message}`);
          }
        } else {
          console.log(
            `Usuario ${userId} inscrito exitosamente en el curso ${courseId}.`
          );
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error("Error en el webhook de Stripe:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 200 });
  }
});
