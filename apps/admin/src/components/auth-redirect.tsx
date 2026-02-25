"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthRedirectProps {
  to: string;
}

export function AuthRedirect({ to }: AuthRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    // Use window.location for more reliable redirect
    window.location.href = to;
  }, [to]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
