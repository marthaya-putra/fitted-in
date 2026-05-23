"use client";

import { createContext, useContext } from "react";
import { authClient } from "@/lib/auth-client";
import type { User } from "better-auth/types";
import {
  useSessionQuery,
  useInvalidateSession,
} from "@/hooks/use-session-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => void;
  isSigningIn: boolean;
  signInError: Error | null;
  signOut: () => Promise<void>;
  isSigningOut: boolean;
  signOutError: Error | null;
  invalidateSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSessionQuery();
  const invalidateSession = useInvalidateSession();
  const queryClient = useQueryClient();

  const signInMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const result = await authClient.signIn.email({ email, password });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: data => {
      queryClient.setQueryData(["session"], { user: data.user });
      invalidateSession();
    },
  });

  const signOutMutation = useMutation({
    mutationFn: async () => {
      await authClient.signOut();
    },
    onSuccess: () => {
      invalidateSession();
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        isLoading: isPending && !session,
        isAuthenticated: !!session,
        signOut: () => signOutMutation.mutateAsync(),
        isSigningOut: signOutMutation.isPending,
        signOutError: signOutMutation.error,
        signIn: (email, password) => signInMutation.mutate({ email, password }),
        isSigningIn: signInMutation.isPending,
        signInError: signInMutation.error,
        invalidateSession,
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
