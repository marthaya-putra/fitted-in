import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export function useSessionQuery() {
  return useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession().then((r) => r.data),
  });
}

export function useInvalidateSession() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: ["session"] });
}
