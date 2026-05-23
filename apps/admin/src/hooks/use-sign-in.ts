import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export function useSignIn() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
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
    onSuccess: (data) => {
      queryClient.setQueryData(["session"], { user: data.user });
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });

  const signIn = useCallback(
    (email: string, password: string) => mutation.mutate({ email, password }),
    [mutation],
  );

  const signInAsync = useCallback(
    (email: string, password: string) => mutation.mutateAsync({ email, password }),
    [mutation],
  );

  return {
    signIn,
    signInAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
