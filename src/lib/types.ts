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
