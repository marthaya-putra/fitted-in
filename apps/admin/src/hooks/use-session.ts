import { useSessionQuery } from "@/hooks/use-session-query";

export function useSession() {
  const { data: session, isPending } = useSessionQuery();
  return {
    user: session?.user ?? null,
    isAuthenticated: !!session,
    isLoading: isPending && !session,
  };
}
