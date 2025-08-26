// src/components/auth/AuthProvider.tsx
"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore, type Membership } from "@/store/authStore";
import { Session } from "@supabase/supabase-js";

// Create a separate async function to fetch memberships.
// This isolates the async logic from the main auth state listener.
async function fetchUserMemberships(userId: string): Promise<Membership[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("community_memberships")
    .select(
      `
      community_id,
      communities (
        name,
        slug,
        image_url
      )
    `
    )
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) {
    console.error("Error fetching user memberships:", error);
    return []; // Return an empty array on error.
  }

  // Transform the data to match the Membership type.
  const transformedMemberships = data.map((m) => ({
    ...m,
    communities: Array.isArray(m.communities)
      ? m.communities[0]
      : m.communities,
  }));

  return transformedMemberships as Membership[];
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseBrowserClient();
  const { setUserSession, setLoading, setUserMemberships } =
    useAuthStore.getState();

  useEffect(() => {
    setLoading(true);

    // The onAuthStateChange listener is no longer async.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session: Session | null) => {
        // First, update the user session synchronously.
        // This is fast and resolves the main loading state quickly.
        setUserSession(session?.user ?? null, session);

        // Then, trigger the asynchronous logic.
        if (event === "SIGNED_IN" && session?.user) {
          // Call our separate function to fetch and set the user's memberships.
          fetchUserMemberships(session.user.id).then((memberships) => {
            setUserMemberships(memberships);
          });
        } else if (event === "SIGNED_OUT") {
          // If the user signs out, clear their memberships.
          setUserMemberships([]);
        }

        // The primary loading state is resolved immediately after the session update.
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
