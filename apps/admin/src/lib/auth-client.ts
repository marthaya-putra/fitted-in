import { createAuthClient } from "better-auth/react";
import { betterAuth } from "better-auth";

// Client-side auth for React components
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_HOST || "http://localhost:3000",
});

// Server-side auth for server components
export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_HOST || "http://localhost:3000",
});
