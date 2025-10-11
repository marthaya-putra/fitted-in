"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, isLoading, isAuthenticated, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/"; // Redirect to home after sign out
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-full items-center px-4 sm:px-6 lg:px-8 justify-between">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              FittedIn Admin
            </span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center">
            {isLoading ? (
              <div className="h-8 w-20 animate-pulse bg-muted rounded"></div>
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  Welcome, {user.name || user.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="h-8"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button asChild variant="default" size="sm" className="h-8">
                <Link href="/sign-in">Sign In</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
