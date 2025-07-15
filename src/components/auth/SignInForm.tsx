// src/components/auth/SignInForm.tsx
"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { useRouter, useSearchParams } from "next/navigation";

export function SignInForm() {
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setLoading, setError, error, isLoading } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
    } else {
      // Smart Redirection: If a redirect path exists in the URL, go there.
      // Otherwise, default to the dashboard.
      router.push(redirectPath || "/dashboard");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email@example.com"
        required
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
