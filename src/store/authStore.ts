// store/authStore.ts
import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";
// Ya no necesitamos el tipo Profile ni el cliente de Supabase aquí

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean; // Este isLoading es solo para la sesión inicial
  error: string | null;
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  setUserSession: (user: User | null, session: Session | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,
  isMobileSidebarOpen: false,
  toggleMobileSidebar: () =>
    set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
  // El setUserSession es más simple ahora
  setUserSession: (user, session) => set({ user, session, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
