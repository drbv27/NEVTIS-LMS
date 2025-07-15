//src/components/auth/AdminProtectedLayout.tsx
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "next/navigation";

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading: isAuthLoading } = useAuthStore();
  const { profile, isLoading: isProfileLoading } = useProfile();
  const router = useRouter();

  useEffect(() => {
    // Once auth and profile loading is complete...
    if (!isAuthLoading && !isProfileLoading) {
      // ...if there's no user or profile, redirect to login.
      if (!user || !profile) {
        router.push("/login");
      }
      // ...if the user role is not sufficient, redirect to the main dashboard.
      else if (profile.role !== "admin" && profile.role !== "teacher") {
        router.push("/dashboard");
      }
    }
  }, [user, profile, isAuthLoading, isProfileLoading, router]);

  // Display a loader while verifying session and profile.
  if (isAuthLoading || isProfileLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Verifying access...</p>
      </div>
    );
  }

  // If all checks pass, render the protected admin content.
  if (
    user &&
    profile &&
    (profile.role === "admin" || profile.role === "teacher")
  ) {
    return <>{children}</>;
  }

  // Fallback to prevent content flashing while redirecting.
  return null;
}
