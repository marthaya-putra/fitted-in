import { createAuthClient } from "better-auth/react";

const base = process.env.NEXT_PUBLIC_APP_HOST;
console.log("BASE URL FROM NEXT_PUBLIC_APP_HOST: ", base);
export const authClient = createAuthClient({
  baseURL: base,
  fetchOptions: {
    credentials: "include",
  },
});
