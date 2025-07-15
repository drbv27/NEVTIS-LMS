// src/hooks/useAdminCategoryMutations.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { type Category } from "@/lib/types";

interface CreateCategoryPayload {
  name: string;
  slug: string;
}

// Usamos Partial<Category> para la actualización, ya que no todos los campos son obligatorios.
interface UpdateCategoryPayload extends Partial<Category> {
  id: number;
}

async function createCategoryFn(payload: CreateCategoryPayload) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from("categories").insert(payload);
  if (error) throw new Error(error.message);
}

async function updateCategoryFn(payload: UpdateCategoryPayload) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from("categories")
    .update({ name: payload.name, slug: payload.slug })
    .eq("id", payload.id);
  if (error) throw new Error(error.message);
}

async function deleteCategoryFn(categoryId: number) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);
  if (error) throw new Error(error.message);
}

export function useAdminCategoryMutations() {
  const queryClient = useQueryClient();

  const commonOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  };

  const { mutate: createCategory, isPending: isCreatingCategory } = useMutation(
    {
      mutationFn: createCategoryFn,
      ...commonOptions,
      onSuccess: () => {
        toast.success("Categoría creada con éxito.");
        commonOptions.onSuccess();
      },
    }
  );

  const { mutate: updateCategory, isPending: isUpdatingCategory } = useMutation(
    {
      mutationFn: updateCategoryFn,
      ...commonOptions,
      onSuccess: () => {
        toast.success("Categoría actualizada con éxito.");
        commonOptions.onSuccess();
      },
    }
  );

  const { mutate: deleteCategory, isPending: isDeletingCategory } = useMutation(
    {
      mutationFn: deleteCategoryFn,
      ...commonOptions,
      onSuccess: () => {
        toast.success("Categoría eliminada con éxito.");
        commonOptions.onSuccess();
      },
    }
  );

  return {
    createCategory,
    isCreatingCategory,
    updateCategory,
    isUpdatingCategory,
    deleteCategory,
    isDeletingCategory,
  };
}
