//src/components/auth/GoogleSignInButton.tsx
"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";

const getRedirectURL = () => {
  let url = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000/";
  // Ensure the URL starts with http and ends with a slash.
  url = url.includes("http") ? url : `https://${url}`;
  url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;
  return `${url}auth/callback`;
};

export function GoogleSignInButton() {
  const supabase = createSupabaseBrowserClient();
  const { setLoading, setError, isLoading } = useAuthStore();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getRedirectURL(),
      },
    });
    // We don't need to handle errors or the final loading state here.
    // signInWithOAuth redirects the user, and any error will be handled on the callback page.
    // setLoading(false) is not reached if the redirection is successful.
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-200 transition-colors"
    >
      <svg
        className="w-5 h-5 mr-2 -ml-1"
        viewBox="0 0 488 512"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 172.9 56.6l-67.1 64.9C333.9 98.4 294.2 86 248 86c-82.3 0-149.3 66.9-149.3 149.3s67 149.3 149.3 149.3c94.9 0 130.3-73.4 134.8-109.9H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"
        ></path>
      </svg>
      {isLoading ? "Redirecting..." : "Continue with Google"}
    </button>
  );
}
