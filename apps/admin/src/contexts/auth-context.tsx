"use client";

import { createContext, useContext } from "react";
import { authClient } from "@/lib/auth";
import type { User } from "better-auth/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    data: session,
    isPending, //loading state
  } = authClient.useSession();

  console.log("Session data AuthProvider: ", session);

  const signOut = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        isLoading: isPending,
        isAuthenticated: !!session,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
