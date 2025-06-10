import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js"; // Quitamos AuthError de aquí

// CORRECCIÓN: Definimos que 'error' solo puede ser un string o nulo.
interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null; // <-- ¡Este es el cambio clave!
  setUserSession: (user: User | null, session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void; // <-- La acción ahora solo acepta string o null
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,
  setUserSession: (user, session) =>
    set({ user, session, isLoading: false, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
  clearAuth: () =>
    set({ user: null, session: null, isLoading: false, error: null }),
}));
