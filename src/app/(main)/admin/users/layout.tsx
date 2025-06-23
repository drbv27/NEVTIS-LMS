// src/app/(main)/admin/users/layout.tsx
"use client";

import SuperAdminProtectedLayout from "@/components/auth/SuperAdminProtectedLayout";

export default function AdminUsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Este layout simplemente envuelve a sus hijos (la página de usuarios)
  // con nuestro nuevo y más estricto guardián de seguridad.
  return <SuperAdminProtectedLayout>{children}</SuperAdminProtectedLayout>;
}
