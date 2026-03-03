import { createAuthClient } from "better-auth/react";

const base = process.env.NEXT_PUBLIC_API_URL;
console.log("BASE URL FROM NEXT_PUBLIC_API_URL: ", base);
export const authClient = createAuthClient({
  baseURL: base,
  fetchOptions: {
    credentials: "include",
  },
});
