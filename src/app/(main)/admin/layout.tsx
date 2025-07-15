// src/app/(main)/admin/layout.tsx
import AdminProtectedLayout from "@/components/auth/AdminProtectedLayout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminProtectedLayout>{children}</AdminProtectedLayout>;
}
