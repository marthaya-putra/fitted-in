"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { authClient } from "@/lib/auth";
import type { User } from "better-auth/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // const {
  //   data: session,
  //   isPending, //loading state
  //   error, //error object
  //   refetch, //refetch the session
  // } = authClient.useSession();

  // console.log({ session });

  const checkAuth = async () => {
    try {
      const session = await authClient.getSession();
      setUser(session.data?.user || null);
    } catch (error) {
      console.error("Failed to check auth:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await authClient.signOut();
      setUser(null);
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        checkAuth,
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
