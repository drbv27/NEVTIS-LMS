// src/hooks/useStripeConnectOnboarding.ts
"use client";

import { useMutation } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
//import { useAuthStore } from "@/store/authStore";

interface OnboardingPayload {
  userId: string; // El ID del partner que queremos conectar
}

async function createStripeConnectAccountLink(payload: OnboardingPayload) {
  const supabase = createSupabaseBrowserClient();

  // Invocamos nuestra Edge Function recién creada
  const { data, error } = await supabase.functions.invoke(
    "create-partner-stripe-account",
    {
      body: { userId: payload.userId }, // Pasamos el ID del usuario
    }
  );

  if (error) {
    console.error("Error invoking Edge Function:", error);
    throw new Error(`Error de red o de función: ${error.message}`);
  }

  // Si la función de Deno devuelve un error dentro de su JSON
  if (data.error) {
    throw new Error(data.error);
  }

  if (!data.onboardingUrl) {
    throw new Error("No se recibió la URL de onboarding desde Stripe.");
  }

  return data.onboardingUrl;
}

export function useStripeConnectOnboarding() {
  //const { user } = useAuthStore();

  const {
    mutate: startOnboarding,
    isPending: isStartingOnboarding,
    error: onboardingError,
  } = useMutation({
    mutationFn: createStripeConnectAccountLink,
    onSuccess: (onboardingUrl) => {
      // Redirigir al usuario a la URL de onboarding de Stripe
      window.location.href = onboardingUrl;
    },
    onError: (error) => {
      toast.error(`Error al iniciar el onboarding de Stripe: ${error.message}`);
    },
  });

  return {
    startOnboarding,
    isStartingOnboarding,
    onboardingError,
    // La mutación necesita el userId, lo pasamos al llamar a startOnboarding( {userId: user.id} )
    // No lo generamos aquí directamente para mantener el hook flexible si se quiere invocar
    // desde un contexto donde el user.id venga de props o de otro lado.
  };
}
