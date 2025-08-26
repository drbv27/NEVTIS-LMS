// src/hooks/useMembershipMutations.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

// Definimos la forma de los datos que necesitará nuestra función
interface RequestMembershipPayload {
  communityId: string;
}

// La función asíncrona que inserta la solicitud en la base de datos
async function requestMembershipFn(
  { communityId }: RequestMembershipPayload,
  userId: string
) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from("community_memberships").insert({
    user_id: userId,
    community_id: communityId,
    status: "pending", // El estado siempre será 'pending' al solicitar
  });

  if (error) {
    if (error.code === "23505") {
      // Código de error para violación de constraint único
      throw new Error("You have already sent a request for this community.");
    }
    throw new Error(`Failed to send request: ${error.message}`);
  }
}

// El hook principal que exportaremos
export function useMembershipMutations() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { mutate: requestMembership, isPending: isRequesting } = useMutation({
    mutationFn: (payload: RequestMembershipPayload) => {
      if (!user) throw new Error("You must be logged in to send a request.");
      return requestMembershipFn(payload, user.id);
    },
    onSuccess: (_, variables) => {
      toast.success("Your request has been sent for approval!");
      // Invalidamos la query que obtiene el estado de la membresía para que la UI se actualice
      queryClient.invalidateQueries({
        queryKey: ["membership-status", variables.communityId, user?.id],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    requestMembership,
    isRequesting,
  };
}
