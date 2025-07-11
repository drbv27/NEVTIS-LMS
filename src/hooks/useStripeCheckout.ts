// src/hooks/useStripeCheckout.ts
"use client";

import { useMutation } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// --- INICIO DE LA CORRECCIÓN ---

// 1. Actualizamos el Payload para que espere un communityId
interface CheckoutPayload {
  communityId: string;
}

// 2. La función ahora recibe y usa el communityId
async function createCheckoutSession({ communityId }: CheckoutPayload) {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase.functions.invoke(
    "create-stripe-checkout",
    {
      // 3. Enviamos el communityId en el cuerpo de la petición
      body: { communityId },
    }
  );

  // --- FIN DE LA CORRECCIÓN ---

  if (error) {
    throw new Error(`Error de red o de función: ${error.message}`);
  }

  if (data.error) {
    throw new Error(data.error);
  }

  if (!data.checkoutUrl) {
    throw new Error("No se recibió la URL de pago desde el servidor.");
  }

  return data.checkoutUrl;
}

export function useStripeCheckout() {
  const { mutate: redirectToCheckout, isPending: isRedirecting } = useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: (checkoutUrl) => {
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
