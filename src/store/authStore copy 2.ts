import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  // --- INICIO DE NUEVAS PROPIEDADES ---
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  // --- FIN DE NUEVAS PROPIEDADES ---
  setUserSession: (user: User | null, session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,
  // --- INICIO DE NUEVOS ESTADOS Y ACCIONES ---
  isMobileSidebarOpen: false, // Por defecto, la sidebar móvil está cerrada
  toggleMobileSidebar: () =>
    set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
  // --- FIN DE NUEVOS ESTADOS Y ACCIONES ---
  setUserSession: (user, session) =>
    set({ user, session, isLoading: false, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
  clearAuth: () =>
    set({ user: null, session: null, isLoading: false, error: null }),
}));
