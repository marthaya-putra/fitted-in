import { cookies } from "next/headers";

export type FetchInput = RequestInfo | URL;

export interface FetchInit extends Omit<RequestInit, "headers"> {
  headers?: HeadersInit;
}

export async function serverFetch(input: FetchInput, init?: FetchInit) {
  const cookieStore = await cookies();

  const headers = new Headers(init?.headers);

  if (!headers.has("Cookie")) {
    headers.set("Cookie", cookieStore.toString());
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const err = await response.json();
    console.error(err);
    throw new Error("Something went wrong!");
  }

  const result = await response.json();
  return result.data;
}
