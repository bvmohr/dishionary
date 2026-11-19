import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/cookbook", "/settings"];
const AUTH_PAGES = ["/login", "/register", "/forgot-password"];

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isGuestOnlyAuthPage(pathname: string): boolean {
  return AUTH_PAGES.some(
    (page) => pathname === page || pathname.startsWith(`${page}/`)
  );
}

/**
 * Refreshes the user's Supabase Auth session cookie and enforces route-level protection.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!rawUrl || !anonKey) {
    return supabaseResponse;
  }

  const url = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
  const pathname = request.nextUrl.pathname;
  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some(
    ({ name }) => name.startsWith("sb-") && name.includes("-auth-token")
  );

  // Skip calling Supabase Auth completely if the visitor has no session cookie
  if (!hasAuthCookie) {
    if (isProtectedRoute(pathname)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(redirectUrl);
    }
    return supabaseResponse;
  }

  // Helper to purge stale/invalid sb-* auth cookies on any response (including redirects)
  const clearStaleAuthCookies = (res: NextResponse) => {
    allCookies.forEach(({ name }) => {
      if (name.startsWith("sb-")) {
        request.cookies.delete(name);
        res.cookies.set(name, "", { path: "/", maxAge: 0 });
      }
    });
  };

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options: CookieOptions }[]
      ) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    clearStaleAuthCookies(supabaseResponse);
  }

  // Redirect unauthenticated visitors trying to access protected routes to /login
  if (!user && isProtectedRoute(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    if (authError) {
      clearStaleAuthCookies(redirectResponse);
    }
    return redirectResponse;
  }

  // Redirect authenticated users away from /login or /register to /dashboard
  if (user && isGuestOnlyAuthPage(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
