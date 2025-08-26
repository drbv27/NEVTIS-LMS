// src/store/authStore.ts
import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";

// 1. DEFINIMOS UN TIPO PARA LAS MEMBRESÍAS
// Esto nos ayudará a mantener el tipado correcto en el store.
export interface Membership {
  community_id: string;
  communities: {
    name: string;
    slug: string;
    image_url: string | null;
  } | null;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;

  // Estados de la UI para las sidebars
  isMainSidebarOpen: boolean;
  isLessonSidebarOpen: boolean;
  toggleMainSidebar: () => void;
  toggleLessonSidebar: () => void;

  // 2. NUEVOS ESTADOS PARA COMUNIDADES
  userMemberships: Membership[]; // Lista de comunidades a las que pertenece el usuario
  activeCommunityId: string | null; // La comunidad que el usuario está viendo actualmente

  // 3. NUEVAS ACCIONES PARA GESTIONAR EL ESTADO DE COMUNIDADES
  setUserMemberships: (memberships: Membership[]) => void;
  setActiveCommunityId: (communityId: string | null) => void;

  // Acciones existentes
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
  userMemberships: [], // Valor inicial
  activeCommunityId: null, // Valor inicial

  toggleMainSidebar: () =>
    set((state) => ({ isMainSidebarOpen: !state.isMainSidebarOpen })),
  toggleLessonSidebar: () =>
    set((state) => ({ isLessonSidebarOpen: !state.isLessonSidebarOpen })),

  // Implementación de las nuevas acciones
  setUserMemberships: (memberships) => {
    set((state) => {
      // Lógica inteligente: Si el usuario tiene membresías,
      // establecemos la primera como la activa por defecto.
      // Si no tiene, la activa se queda en null.
      const newActiveCommunityId =
        state.activeCommunityId &&
        memberships.some((m) => m.community_id === state.activeCommunityId)
          ? state.activeCommunityId
          : memberships[0]?.community_id || null;

      return {
        userMemberships: memberships,
        activeCommunityId: newActiveCommunityId,
      };
    });
  },

  setActiveCommunityId: (communityId) =>
    set({ activeCommunityId: communityId }),

  // Implementación de las acciones existentes
  setUserSession: (user, session) =>
    set({ user, session, isLoading: false, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
}));
