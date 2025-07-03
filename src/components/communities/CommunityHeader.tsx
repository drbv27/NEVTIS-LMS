// src/components/communities/CommunityHeader.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { type Community } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { CheckCircle, CreditCard, Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { type Membership } from "@/store/authStore";

interface CommunityHeaderProps {
  community: Community;
}

export default function CommunityHeader({ community }: CommunityHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userMemberships, setUserMemberships } = useAuthStore();
  const { redirectToCheckout, isRedirecting } = useStripeCheckout();

  // --- INICIO DE LA LÓGICA DE COMPRA EXITOSA ---
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(
    searchParams.get("purchase") === "success"
  );

  useEffect(() => {
    // Si la URL contiene ?purchase=success, iniciamos el proceso de verificación
    if (isProcessingPurchase) {
      const timeout = setTimeout(async () => {
        // Después de 3 segundos, volvemos a pedir las membresías del usuario a la BD
        if (user) {
          const supabase = createSupabaseBrowserClient();
          const { data: memberships } = await supabase
            .from("community_memberships")
            .select("*, communities(*)")
            .eq("user_id", user.id);

          // Actualizamos nuestro store de Zustand con la nueva información
          setUserMemberships((memberships as Membership[]) || []);
        }

        // Limpiamos la URL para que el usuario no se quede en este estado si refresca
        router.replace(`/community/${community.slug}`);
        setIsProcessingPurchase(false);
      }, 3000); // Esperamos 3 segundos para dar tiempo al webhook

      // Limpiamos el temporizador si el componente se desmonta
      return () => clearTimeout(timeout);
    }
  }, [isProcessingPurchase, community.slug, router, setUserMemberships, user]);
  // --- FIN DE LA LÓGICA DE COMPRA EXITOSA ---

  const isMember = userMemberships.some((m) => m.community_id === community.id);

  const handleSubscribeClick = () => {
    if (!community.stripe_price_id) {
      alert("Esta comunidad no tiene una suscripción configurada.");
      return;
    }
    redirectToCheckout({ communityId: community.id });
  };

  return (
    <div className="text-center my-12 p-6 bg-muted/50 rounded-lg">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Comunidad: {community.name}
      </h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
        {community.description ||
          "Explora todos los cursos disponibles en esta comunidad."}
      </p>

      <div className="mt-8">
        {/* --- LÓGICA DE RENDERIZADO MEJORADA --- */}
        {isProcessingPurchase ? (
          <div className="inline-flex items-center gap-2 text-blue-600 font-semibold py-2 px-4 bg-blue-100 rounded-full">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Procesando tu suscripción...</span>
          </div>
        ) : isMember ? (
          <div className="inline-flex items-center gap-2 text-green-600 font-semibold py-2 px-4 bg-green-100 rounded-full">
            <CheckCircle className="h-5 w-5" />
            <span>Ya eres miembro</span>
          </div>
        ) : (
          <Button
            size="lg"
            onClick={handleSubscribeClick}
            disabled={isRedirecting}
          >
            {isRedirecting ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <CreditCard className="mr-2 h-5 w-5" />
            )}
            <span>
              {isRedirecting
                ? "Redirigiendo a pago..."
                : "Unirme a la Comunidad (Suscribirse)"}
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}
