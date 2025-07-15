// src/components/communities/CommunityHeader.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { type Community } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { CheckCircle, CreditCard, Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { type Membership } from "@/store/authStore";

interface CommunityHeaderProps {
  community: Community;
}

export default function CommunityHeader({ community }: CommunityHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userMemberships, setUserMemberships } = useAuthStore();
  const { redirectToCheckout, isRedirecting } = useStripeCheckout();

  const [isProcessingPurchase, setIsProcessingPurchase] = useState(
    searchParams.get("purchase") === "success"
  );

  useEffect(() => {
    // If the URL contains ?purchase=success, start the verification process.
    if (isProcessingPurchase) {
      // After a delay, re-fetch user memberships to confirm the purchase.
      const timeout = setTimeout(async () => {
        if (user) {
          const supabase = createSupabaseBrowserClient();
          const { data: memberships } = await supabase
            .from("community_memberships")
            .select("*, communities(*)")
            .eq("user_id", user.id);

          // Update the Zustand store with the new membership information.
          setUserMemberships((memberships as Membership[]) || []);
        }

        // Clean the URL to prevent re-triggering this effect on refresh.
        router.replace(`/community/${community.slug}`);
        setIsProcessingPurchase(false);
      }, 3000); // Wait for 3 seconds to allow time for the webhook to process.

      // Clean up the timer if the component unmounts.
      return () => clearTimeout(timeout);
    }
  }, [isProcessingPurchase, community.slug, router, setUserMemberships, user]);

  const isMember = userMemberships.some((m) => m.community_id === community.id);

  const handleSubscribeClick = () => {
    if (!community.stripe_price_id) {
      alert("This community does not have a subscription configured.");
      return;
    }
    redirectToCheckout({ communityId: community.id });
  };

  return (
    <div className="text-center my-12 p-6 bg-muted/50 rounded-lg">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Community: {community.name}
      </h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
        {community.description ||
          "Explore all the courses available in this community."}
      </p>

      <div className="mt-8">
        {isProcessingPurchase ? (
          <div className="inline-flex items-center gap-2 text-blue-600 font-semibold py-2 px-4 bg-blue-100 rounded-full">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Processing your subscription...</span>
          </div>
        ) : isMember ? (
          <div className="inline-flex items-center gap-2 text-green-600 font-semibold py-2 px-4 bg-green-100 rounded-full">
            <CheckCircle className="h-5 w-5" />
            <span>You are already a member</span>
          </div>
        ) : (
          <Button
            size="lg"
            onClick={handleSubscribeClick}
            disabled={isRedirecting}
          >
            {isRedirecting ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <CreditCard className="mr-2 h-5 w-5" />
            )}
            <span>
              {isRedirecting
                ? "Redirecting to payment..."
                : "Join the Community (Subscribe)"}
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}
