//src/store/authStore.ts
import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  isMainSidebarOpen: boolean;
  isLessonSidebarOpen: boolean;
  toggleMainSidebar: () => void;
  toggleLessonSidebar: () => void;
  setUserSession: (user: User | null, session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,
  isMainSidebarOpen: true,
  isLessonSidebarOpen: true,
  toggleMainSidebar: () =>
    set((state) => ({ isMainSidebarOpen: !state.isMainSidebarOpen })),
  toggleLessonSidebar: () =>
    set((state) => ({ isLessonSidebarOpen: !state.isLessonSidebarOpen })),

  // --- INICIO DE LA CORRECCIÓN DE TIPOS ---
  setUserSession: (user: User | null, session: Session | null) =>
    set({ user, session, isLoading: false, error: null }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error, isLoading: false }),
  // --- FIN DE LA CORRECCIÓN DE TIPOS ---
}));
