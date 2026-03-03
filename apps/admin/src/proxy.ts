import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Forward cookies from backend rewrite responses
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (backendUrl) {
      // Clone request with proper cookie forwarding
      const proxyRequest = new Request(request.url, {
        method: request.method,
        headers: {
          ...Object.fromEntries(request.headers),
          cookie: request.headers.get("cookie") || "",
        },
        body: request.body,
        // @ts-ignore - duplex is required for fetch with body
        duplex: "half",
      });

      const proxyResponse = await fetch(
        request.nextUrl.pathname.replace("/api/", `${backendUrl}/api/`),
        proxyRequest
      );

      // Forward Set-Cookie headers, fixing the domain
      const setCookie = proxyResponse.headers.get("set-cookie");
      if (setCookie) {
        response.headers.set("set-cookie", setCookie);
      }

      return new Response(proxyResponse.body, {
        status: proxyResponse.status,
        headers: response.headers,
      });
    }
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
