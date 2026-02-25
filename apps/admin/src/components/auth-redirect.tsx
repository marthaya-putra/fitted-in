"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthRedirectProps {
  to: string;
}

export function AuthRedirect({ to }: AuthRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    // Try router.replace first, fallback to window.location
    try {
      router.replace(to);
    } catch {
      window.location.href = to;
    }
  }, [router, to]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
