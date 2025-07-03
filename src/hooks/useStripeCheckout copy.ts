// src/hooks/useStripeCheckout.ts
"use client";

import { useMutation } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// Define la estructura de datos que necesita nuestra Edge Function
interface CheckoutPayload {
  priceId: string;
  courseId: string;
}

// La función que llama a nuestra Edge Function
async function createCheckoutSession({ priceId, courseId }: CheckoutPayload) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.functions.invoke(
    "create-stripe-checkout",
    {
      body: { priceId, courseId },
    }
  );

  if (error) {
    // Esto captura errores de red o si la función no se encuentra
    throw new Error(`Error de red o de función: ${error.message}`);
  }

  if (data.error) {
    // Esto captura los errores lógicos que devolvemos desde dentro de la función
    throw new Error(data.error);
  }

  if (!data.checkoutUrl) {
    throw new Error("No se recibió la URL de pago desde el servidor.");
  }

  // Si todo va bien, devolvemos la URL de pago
  return data.checkoutUrl;
}

// El hook que exportaremos para usar en nuestros componentes
export function useStripeCheckout() {
  const { mutate: redirectToCheckout, isPending: isRedirecting } = useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: (checkoutUrl) => {
      // Si la mutación es exitosa (obtenemos una URL), redirigimos al usuario
      window.location.href = checkoutUrl;
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    redirectToCheckout,
    isRedirecting,
  };
}
