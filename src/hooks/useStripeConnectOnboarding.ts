// src/hooks/useStripeConnectOnboarding.ts
"use client";

import { useMutation } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// Definimos la forma de los datos que nuestra función de mutación necesitará
interface OnboardingPayload {
  userId: string;
}

// Esta es la función asíncrona que llamará a nuestra Edge Function de Supabase
async function createStripeConnectAccountLink(
  payload: OnboardingPayload
): Promise<string> {
  const supabase = createSupabaseBrowserClient();

  // Invocamos la Edge Function que crearemos en el siguiente paso
  const { data, error } = await supabase.functions.invoke(
    "create-partner-stripe-account",
    {
      body: { userId: payload.userId },
    }
  );

  if (error) {
    console.error("Error invoking Edge Function:", error);
    throw new Error(`Network or function error: ${error.message}`);
  }

  // Si la función de Deno devuelve un error dentro de su respuesta JSON
  if (data.error) {
    throw new Error(data.error);
  }

  if (!data.onboardingUrl) {
    throw new Error("Onboarding URL not received from Stripe.");
  }

  return data.onboardingUrl;
}

export function useStripeConnectOnboarding() {
  const { mutate: startOnboarding, isPending: isStartingOnboarding } =
    useMutation({
      mutationFn: createStripeConnectAccountLink,
      onSuccess: (onboardingUrl) => {
        // Si todo sale bien, redirigimos al usuario a la URL de Stripe
        window.location.href = onboardingUrl;
      },
      onError: (error) => {
        toast.error(`Failed to start Stripe onboarding: ${error.message}`);
      },
    });

  return {
    startOnboarding,
    isStartingOnboarding,
  };
}
