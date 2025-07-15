// src/hooks/useAdminCategories.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { type Category } from "@/lib/types";

async function fetchAdminCategories(): Promise<Category[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error("No se pudieron cargar las categorías.");
  }
  return data;
}

export function useAdminCategories() {
  return useQuery<Category[], Error>({
    queryKey: ["admin-categories"],
    queryFn: fetchAdminCategories,
  });
}
