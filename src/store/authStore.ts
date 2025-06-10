// store/authStore.ts
import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";

// --- INICIO DE LA CORRECCIÓN ---
// Volvemos a añadir 'error' y 'setError' a nuestra interfaz de estado
interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null; // <-- Propiedad reincorporada
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  setUserSession: (user: User | null, session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void; // <-- Función reincorporada
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null, // <-- Propiedad reincorporada
  isMobileSidebarOpen: false,
  toggleMobileSidebar: () =>
    set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),

  // Limpiamos el error al establecer una sesión exitosa
  setUserSession: (user, session) =>
    set({ user, session, isLoading: false, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),

  // Reincorporamos la función setError
  setError: (error) => set({ error, isLoading: false }),
}));
// --- FIN DE LA CORRECCIÓN ---
