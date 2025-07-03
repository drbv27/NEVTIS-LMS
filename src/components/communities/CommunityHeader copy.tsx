// src/components/communities/CommunityHeader.tsx
"use client";

import { useAuthStore } from "@/store/authStore";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { type Community } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { CheckCircle, CreditCard, Loader2 } from "lucide-react";

interface CommunityHeaderProps {
  community: Community;
}

export default function CommunityHeader({ community }: CommunityHeaderProps) {
  // Obtenemos las membresías del usuario desde nuestro store de Zustand
  const { userMemberships } = useAuthStore();
  const { redirectToCheckout, isRedirecting } = useStripeCheckout();

  // Verificamos si el usuario es miembro de ESTA comunidad
  const isMember = userMemberships.some((m) => m.community_id === community.id);

  const handleSubscribeClick = () => {
    if (!community.stripe_price_id) {
      alert("Esta comunidad no tiene una suscripción configurada.");
      return;
    }
    redirectToCheckout({
      communityId: community.id,
    });
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

      {/* --- Lógica de la Puerta de Acceso --- */}
      <div className="mt-8">
        {isMember ? (
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
