// src/app/(main)/partner/stripe-settings/page.tsx
"use client";

import { useProfile } from "@/hooks/useProfile";
import { useStripeConnectOnboarding } from "@/hooks/useStripeConnectOnboarding";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Zap } from "lucide-react";
//import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function PartnerStripeSettingsPage() {
  const { profile, isLoading: isProfileLoading } = useProfile();
  const { startOnboarding, isStartingOnboarding } =
    useStripeConnectOnboarding();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Estado para manejar las redirecciones de Stripe
  const [stripeStatus, setStripeStatus] = useState<"success" | "error" | null>(
    null
  );

  useEffect(() => {
    const status = searchParams.get("stripe-status");
    if (status === "success") {
      setStripeStatus("success");
      toast.success(
        "¡Cuenta Stripe conectada o actualizada con éxito! Puede que Stripe necesite unos minutos para verificar los datos."
      );
      // Invalida la query del perfil para obtener el stripe_account_id actualizado
      queryClient.invalidateQueries({ queryKey: ["profile", profile?.id] });
    } else if (status === "error") {
      setStripeStatus("error");
      toast.error(
        "Hubo un error al conectar tu cuenta Stripe. Por favor, inténtalo de nuevo."
      );
    }
    // Limpiar el URL para evitar re-notificaciones al refrescar
    if (status) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("stripe-status");
      window.history.replaceState({}, "", newUrl.toString());
    }
  }, [searchParams, queryClient, profile?.id]);

  if (isProfileLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Cargando configuración de Stripe...</p>
      </div>
    );
  }

  const handleConnectStripe = () => {
    if (profile?.id) {
      startOnboarding({ userId: profile.id });
    } else {
      toast.error(
        "No se pudo obtener el ID de usuario para conectar con Stripe."
      );
    }
  };

  const isStripeConnected = !!profile?.stripe_account_id;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Stripe Connect Settings</h1>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Manage your Payments</CardTitle>
          <CardDescription>
            Connect your Stripe account to receive payments from your community
            subscriptions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isStripeConnected ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Your Stripe account is not yet connected. Connect it to start
                receiving payments.
              </p>
              <Button
                size="lg"
                onClick={handleConnectStripe}
                disabled={isStartingOnboarding}
              >
                {isStartingOnboarding ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                    Connecting...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" /> Connect Stripe Account
                  </>
                )}
              </Button>
              {stripeStatus === "error" && (
                <p className="text-destructive text-sm mt-2">
                  Please try connecting your Stripe account again.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-green-500" />
                <p className="font-semibold text-green-600">
                  Your Stripe account is connected!
                </p>
              </div>
              <p className="text-muted-foreground text-sm">
                **Stripe Account ID:**{" "}
                <code className="bg-muted p-1 rounded-sm">
                  {profile.stripe_account_id}
                </code>
              </p>
              <p className="text-sm text-muted-foreground">
                You might need to complete additional steps on Stripe&apos;s
                dashboard to enable payouts.
              </p>
              <Button
                variant="outline"
                onClick={handleConnectStripe} // Permite al usuario volver a Stripe para actualizar info
                disabled={isStartingOnboarding}
              >
                {isStartingOnboarding ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Zap className="mr-2 h-5 w-5" />
                )}
                Manage Stripe Account
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Clicking &quot;Manage Stripe Account&quot; will redirect you to
                Stripe&apos;s dashboard.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sección para mostrar ganancias y suscriptores (futura implementación) */}
      {isStripeConnected && (
        <Card className="shadow-md mt-8">
          <CardHeader>
            <CardTitle>Your Earnings</CardTitle>
            <CardDescription>
              Overview of your earnings and active subscribers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-2xl font-bold">Total Earned: $0.00</p>
            <p className="text-xl font-bold">Active Subscribers: 0</p>
            <p className="text-muted-foreground text-sm">
              (This data will be displayed here once fully implemented)
            </p>
            {/* Aquí irían las llamadas a los nuevos hooks para obtener esta información */}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
