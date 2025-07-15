// src/components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { LogOut, Menu } from "lucide-react";
import { Button } from "../ui/button";
import NotificationsBell from "../notifications/NotificationsBell";

export default function Navbar() {
  const { user, isLoading, toggleMainSidebar } = useAuthStore();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="bg-background sticky top-0 z-20 border-b border-border h-16 flex items-center">
      <nav className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={toggleMainSidebar}
              variant="ghost"
              size="icon"
              className="sm:hidden"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            {isLoading ? (
              <div className="h-8 w-24 bg-muted rounded-md animate-pulse"></div>
            ) : user ? (
              <>
                <NotificationsBell />
                <span className="hidden sm:block text-sm font-medium text-muted-foreground">
                  {user.email}
                </span>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="icon"
                  aria-label="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Link href="/login" passHref>
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
