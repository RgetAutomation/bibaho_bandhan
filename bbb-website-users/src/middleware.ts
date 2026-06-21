// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  // const session = await auth(); // reads cookies automatically
  const sessionCookie = getSessionCookie(request, {
    cookiePrefix: "bbbuser",
  });

  if (!sessionCookie && request.nextUrl.pathname.startsWith("/users")) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}
export const config = {
  matcher: ["/users/:path*"],
};
