import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export function useSignOut() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => authClient.signOut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });

  const signOut = useCallback(() => mutation.mutate(), [mutation]);

  const signOutAsync = useCallback(() => mutation.mutateAsync(), [mutation]);

  return {
    signOut,
    signOutAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
