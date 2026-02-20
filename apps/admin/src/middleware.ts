import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

const publicRoutes = ["/sign-in", "/sign-up", "/privacy"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  const cookieStore = await cookies();
  const hasSessionToken = cookieStore.get("better-auth.session_token")?.value;

  // Signed-in user visiting auth pages -> redirect to home
  if (hasSessionToken && (pathname === "/sign-in" || pathname === "/sign-up")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Unsigned-in user visiting protected route -> redirect to sign-in
  if (!hasSessionToken && !isPublicRoute) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("callbackURL", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
