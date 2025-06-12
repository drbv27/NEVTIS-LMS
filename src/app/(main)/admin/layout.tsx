// app/admin/layout.tsx
import AdminProtectedLayout from "@/components/auth/AdminProtectedLayout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Este layout simplemente envuelve a sus hijos con el guardián de seguridad de admin.
  // No renderiza la Navbar o Sidebar principal porque el layout de (main) ya lo hace.
  // Si quisiéramos un layout de admin totalmente diferente, lo pondríamos aquí.
  return <AdminProtectedLayout>{children}</AdminProtectedLayout>;
}
