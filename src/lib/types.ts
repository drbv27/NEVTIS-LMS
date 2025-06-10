// lib/types.ts
export interface Profile {
  id: string;
  full_name?: string | null;
  phone_number?: string | null;
  bio?: string | null;
  // La columna 'social_links' en Supabase es de tipo JSONB
  social_links?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  } | null;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  is_free: boolean;
  // La relación con categories nos traerá el objeto completo
  categories: {
    name: string;
    slug: string;
  } | null;
}
