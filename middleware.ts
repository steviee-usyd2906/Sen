// Route gating — structured after INFO2222/lib/supabase/middleware.ts
// (updateSession), adapted for a mostly-public marketing site:
//
//   · /account/*            → requires the session cookie (else /sign-in)
//   · authed /api/auth/*    → 401 JSON when no cookie (like INFO2222's
//                             isApiRoute branch)
//   · /sign-in with cookie  → redirect home (INFO2222 redirects authed
//                             users away from /login and /register)
//
// Edge runtime note: this layer only checks cookie PRESENCE — the token
// is cryptographically validated against the sessions store inside every
// route handler (requireSession). Same defense split as INFO2222, whose
// middleware short-circuits on missing cookies before deep validation.

import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "sen_session";

// Auth API endpoints that must be reachable WITHOUT a session.
const PUBLIC_AUTH_API = new Set([
  "/api/auth/register",
  "/api/auth/login",
  "/api/auth/logout",
]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = !!request.cookies.get(SESSION_COOKIE)?.value;

  const isAccountArea = pathname.startsWith("/account");
  const isAuthApi = pathname.startsWith("/api/auth");
  const isSignInPage = pathname === "/sign-in";

  if (!hasSessionCookie) {
    if (isAuthApi && !PUBLIC_AUTH_API.has(pathname)) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }
    if (isAccountArea) {
      const url = request.nextUrl.clone();
      url.pathname = "/sign-in";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (isSignInPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/api/auth/:path*", "/sign-in"],
};
