// src/hooks/useAdminCommunityMutations.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { type Community } from "@/lib/types";

// Definimos la forma de los datos que necesitan nuestras funciones
interface CreateCommunityPayload {
  name: string;
  slug: string;
  description: string | null;
  stripe_price_id: string | null;
  status: Community["status"];
  imageFile: File;
}

interface UpdateCommunityPayload {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  stripe_price_id: string | null;
  status: Community["status"];
  imageFile?: File | null;
}

interface DeleteCommunityPayload {
  id: string;
  image_url: string | null;
}

// --- LÓGICA DE LAS FUNCIONES ---

async function createCommunityFn(
  payload: CreateCommunityPayload
): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { data: newCommunity, error: insertError } = await supabase
    .from("communities")
    .insert({
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      stripe_price_id: payload.stripe_price_id,
      status: payload.status,
    })
    .select("id")
    .single();

  if (insertError) {
    if (insertError.message.includes("duplicate key value")) {
      throw new Error("El 'slug' ya está en uso. Por favor, elige otro.");
    }
    throw new Error(`Error al crear la comunidad: ${insertError.message}`);
  }

  const fileExt = payload.imageFile.name.split(".").pop();
  const filePath = `${newCommunity.id}/cover.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("community-images")
    .upload(filePath, payload.imageFile);

  if (uploadError)
    throw new Error(`Error al subir la imagen: ${uploadError.message}`);

  const { data: urlData } = supabase.storage
    .from("community-images")
    .getPublicUrl(filePath);

  const cacheBustedUrl = `${urlData.publicUrl}?t=${new Date().getTime()}`;

  const { error: updateError } = await supabase
    .from("communities")
    .update({ image_url: cacheBustedUrl })
    .eq("id", newCommunity.id);

  if (updateError)
    throw new Error(
      `Error al actualizar la URL de la imagen: ${updateError.message}`
    );
}

async function updateCommunityFn(
  payload: UpdateCommunityPayload
): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { id, imageFile, ...textData } = payload;

  const dataToUpdate: Partial<Community> = { ...textData };

  if (imageFile) {
    const fileExt = imageFile.name.split(".").pop();
    const filePath = `${id}/cover.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("community-images")
      .upload(filePath, imageFile, { upsert: true });

    if (uploadError)
      throw new Error(`Error al subir la nueva imagen: ${uploadError.message}`);

    const { data: urlData } = supabase.storage
      .from("community-images")
      .getPublicUrl(filePath);
    dataToUpdate.image_url = `${urlData.publicUrl}?t=${new Date().getTime()}`;
  }

  const { error } = await supabase
    .from("communities")
    .update(dataToUpdate)
    .eq("id", id);

  if (error) {
    if (error.message.includes("duplicate key value")) {
      throw new Error("El 'slug' ya está en uso. Por favor, elige otro.");
    }
    throw new Error(`Error al actualizar la comunidad: ${error.message}`);
  }
}

async function deleteCommunityFn({
  id,
}: DeleteCommunityPayload): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.functions.invoke("delete-community", {
    body: { communityId: id },
  });

  if (error) {
    throw new Error(`Error al eliminar la comunidad: ${error.message}`);
  }
}

// --- HOOK PRINCIPAL ---

export function useAdminCommunityMutations() {
  const queryClient = useQueryClient();

  const { mutate: createCommunity, isPending: isCreatingCommunity } =
    useMutation({
      mutationFn: createCommunityFn,
      onSuccess: () => {
        toast.success("¡Comunidad creada con éxito!");
        queryClient.invalidateQueries({ queryKey: ["admin-communities"] });
        queryClient.invalidateQueries({ queryKey: ["public-communities"] });
      },
      onError: (error) => toast.error(error.message),
    });

  const { mutate: updateCommunity, isPending: isUpdatingCommunity } =
    useMutation({
      mutationFn: updateCommunityFn,
      onSuccess: () => {
        toast.success("¡Comunidad actualizada con éxito!");
        queryClient.invalidateQueries({ queryKey: ["admin-communities"] });
        queryClient.invalidateQueries({ queryKey: ["public-communities"] });
      },
      onError: (error) => toast.error(error.message),
    });

  const { mutate: deleteCommunity, isPending: isDeletingCommunity } =
    useMutation({
      mutationFn: deleteCommunityFn,
      onSuccess: () => {
        toast.success("Comunidad eliminada con éxito.");
        queryClient.invalidateQueries({ queryKey: ["admin-communities"] });
        queryClient.invalidateQueries({ queryKey: ["public-communities"] });
      },
      onError: (error) => toast.error(error.message),
    });

  return {
    createCommunity,
    isCreatingCommunity,
    updateCommunity,
    isUpdatingCommunity,
    deleteCommunity,
    isDeletingCommunity,
  };
}
