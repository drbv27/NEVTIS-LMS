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
import { toast } from "sonner";

export default function PartnerStripeSettingsPage() {
  const { profile, isLoading: isProfileLoading } = useProfile();
  const { startOnboarding, isStartingOnboarding } =
    useStripeConnectOnboarding();

  const handleConnectStripe = () => {
    if (profile?.id) {
      startOnboarding({ userId: profile.id });
    } else {
      toast.error("Could not get user ID to connect with Stripe.");
    }
  };

  const isStripeConnected = !!profile?.stripe_account_id;

  if (isProfileLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading Stripe settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Stripe Connect Settings</h1>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Manage Your Payments</CardTitle>
          <CardDescription>
            Connect your Stripe account to receive payments for your community
            subscriptions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isStripeConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-green-500" />
                <p className="font-semibold text-green-600">
                  Your Stripe account is connected!
                </p>
              </div>
              <p className="text-muted-foreground text-sm">
                Your Stripe Account ID:{" "}
                <code className="bg-muted p-1 rounded-sm">
                  {profile.stripe_account_id}
                </code>
              </p>
              <Button
                variant="outline"
                onClick={handleConnectStripe}
                disabled={isStartingOnboarding}
              >
                {isStartingOnboarding ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : null}
                Manage Stripe Account
              </Button>
            </div>
          ) : (
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
