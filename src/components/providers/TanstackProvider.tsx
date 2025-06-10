// components/providers/TanstackProvider.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function TanstackProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Creamos una única instancia del QueryClient
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
