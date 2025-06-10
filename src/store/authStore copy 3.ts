import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types"; // <-- Importamos nuestro nuevo tipo
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Creamos una instancia del cliente aquí para usarla en las acciones del store
const supabase = createSupabaseBrowserClient();

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null; // <-- Nuevo estado para el perfil
  isLoading: boolean;
  error: string | null;
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  setUserSession: (user: User | null, session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
  fetchProfile: () => Promise<void>; // <-- Nueva acción para buscar el perfil
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null, // <-- Estado inicial
  isLoading: true,
  error: null,
  isMobileSidebarOpen: false,
  toggleMobileSidebar: () =>
    set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
  setUserSession: (user, session) =>
    set({ user, session, isLoading: false, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
  clearAuth: () =>
    set({
      user: null,
      session: null,
      profile: null,
      isLoading: false,
      error: null,
    }),

  // --- NUEVA ACCIÓN ASÍNCRONA ---
  fetchProfile: async () => {
    const { user } = get(); // Obtenemos el usuario actual del estado
    if (!user) {
      set({ profile: null });
      return;
    }

    try {
      const { data, error, status } = await supabase
        .from("profiles")
        .select(`*`)
        .eq("id", user.id)
        .single();

      if (error && status !== 406) {
        console.error("Error fetching profile:", error);
        set({ profile: null });
      } else if (data) {
        set({ profile: data as Profile });
      }
    } catch (error) {
      console.error("Unexpected error fetching profile:", error);
      set({ profile: null });
    }
  },
}));
