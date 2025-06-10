import ProtectedLayout from "@/components/auth/ProtectedLayout";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayout>
      <div className="relative min-h-screen">
        <Sidebar />
        {/* Hacemos espacio para la sidebar en desktop */}
        <div className="sm:pl-64">
          <Navbar />
          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </ProtectedLayout>
  );
}
