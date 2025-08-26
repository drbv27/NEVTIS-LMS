// src/components/communities/CommunityHeader.tsx
"use client";

import { useAuthStore } from "@/store/authStore";
import { useMembershipMutations } from "@/hooks/useMembershipMutations";
import { useMembershipStatus } from "@/hooks/useMembershipStatus"; // Importamos el nuevo hook
import { type Community } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface CommunityHeaderProps {
  community: Community;
}

export default function CommunityHeader({ community }: CommunityHeaderProps) {
  const { user } = useAuthStore();
  const router = useRouter();

  // Usamos nuestros nuevos hooks
  const { data: membershipStatus, isLoading: isLoadingStatus } =
    useMembershipStatus(community.id);
  const { requestMembership, isRequesting } = useMembershipMutations();

  const handleRequestAccess = () => {
    if (!user) {
      // Si el usuario no está logueado, lo redirigimos al login
      router.push(`/login?redirect=/community/${community.slug}`);
      return;
    }
    requestMembership({ communityId: community.id });
  };

  // Función para renderizar el botón de acción según el estado
  const renderActionButton = () => {
    if (isLoadingStatus) {
      return (
        <Button size="lg" disabled>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Verificando Acceso...
        </Button>
      );
    }

    switch (membershipStatus) {
      case "active":
        return (
          <div className="inline-flex items-center gap-2 text-green-600 font-semibold py-2 px-4 bg-green-100 rounded-full">
            <CheckCircle className="h-5 w-5" />
            <span>Ya eres miembro</span>
          </div>
        );
      case "pending":
        return (
          <Button size="lg" disabled>
            <Clock className="mr-2 h-5 w-5" />
            Solicitud Pendiente de Aprobación
          </Button>
        );
      case "none":
      default:
        return (
          <Button
            size="lg"
            onClick={handleRequestAccess}
            disabled={isRequesting}
          >
            {isRequesting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Enviando Solicitud...
              </>
            ) : (
              "Solicitar Acceso a la Comunidad"
            )}
          </Button>
        );
    }
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

      <div className="mt-8">{renderActionButton()}</div>
    </div>
  );
}
