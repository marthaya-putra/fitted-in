import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { authClient } from "./auth-client";

export async function getAuthSession() {
  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
      credentials: "include",
    },
  });

  if (!session) {
    redirect("/sign-in");
  }

  return session;
}
