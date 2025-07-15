// src/app/(auth)/login/page.tsx
import { Suspense } from "react"; // 1. IMPORTAMOS Suspense
import { SignInForm } from "@/components/auth/SignInForm";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Skeleton } from "@/components/ui/skeleton"; // Importamos Skeleton

// 2. CREAMOS UN COMPONENTE SIMPLE DE CARGA
function SignInFormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full bg-primary/50" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Accede a tu cuenta
          </h2>
        </div>
        <div className="p-8 bg-white shadow-lg rounded-lg">
          {/* 3. ENVOLVEMOS EL FORMULARIO CON SUSPENSE */}
          <Suspense fallback={<SignInFormSkeleton />}>
            <SignInForm />
          </Suspense>

          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">O</span>
            </div>
          </div>
          <GoogleSignInButton />
        </div>
      </div>
    </div>
  );
}
