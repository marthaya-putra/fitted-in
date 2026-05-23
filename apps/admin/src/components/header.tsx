"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import { useSignOut } from "@/hooks/use-sign-out";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, isLoading, isAuthenticated } = useSession();
  const { signOutAsync, isPending } = useSignOut();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOutAsync();
    router.push("/sign-in");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/50 bg-primary backdrop-blur supports-[backdrop-filter]:bg-primary/95">
      <div className="container flex h-14 max-w-full items-center px-4 sm:px-6 lg:px-8 justify-between">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block text-primary-foreground">
              FittedIn Admin
            </span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-4">
            <Link
              href="/privacy"
              className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            {isLoading ? (
              <div className="h-8 w-20 animate-pulse bg-primary-foreground/20 rounded"></div>
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/optimize"
                  className="text-sm font-medium text-primary-foreground hover:text-primary-foreground/80 transition-colors"
                >
                  Optimize Resume
                </Link>
                <span className="text-sm text-primary-foreground/80">
                  Welcome, {user.name || user.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  disabled={isPending}
                  className="h-8 bg-primary-foreground text-primary hover:bg-primary-foreground/90 border-primary-foreground/50"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                asChild
                variant="default"
                size="sm"
                className="h-8 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                <Link href="/sign-in">Sign In</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
