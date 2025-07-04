// src/app/(main)/dashboard/page.tsx
import DashboardManager from "@/components/dashboard/DashboardManager";

export default function DashboardPage() {
  // La página ahora solo se encarga de renderizar el gestor,
  // que contiene toda la lógica.
  return <DashboardManager />;
}
