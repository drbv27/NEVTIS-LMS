// src/app/(main)/admin/users/layout.tsx
"use client";

import SuperAdminProtectedLayout from "@/components/auth/SuperAdminProtectedLayout";

export default function AdminUsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SuperAdminProtectedLayout>{children}</SuperAdminProtectedLayout>;
}
