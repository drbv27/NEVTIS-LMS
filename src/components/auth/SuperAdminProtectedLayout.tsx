//src/components/auth/SuperAdminProtectedLayout.tsx
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SuperAdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading: isAuthLoading } = useAuthStore();
  const { profile, isLoading: isProfileLoading } = useProfile();
  const router = useRouter();

  useEffect(() => {
    // Once authentication and profile loading are complete...
    if (!isAuthLoading && !isProfileLoading) {
      // If there's no user/profile, or the role is NOT 'admin', redirect.
      if (!user || !profile || profile.role !== "admin") {
        toast.error("Access denied. Administrator permissions required.");
        router.push("/dashboard");
      }
    }
  }, [user, profile, isAuthLoading, isProfileLoading, router]);

  // Show a loader while checks are in progress.
  if (isAuthLoading || isProfileLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Verifying administrator permissions...</p>
      </div>
    );
  }

  // If all checks pass, render the protected content.
  if (user && profile && profile.role === "admin") {
    return <>{children}</>;
  }

  // Fallback to prevent content flashing while redirecting.
  return null;
}
