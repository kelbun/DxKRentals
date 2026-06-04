import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// TO ENABLE COMING SOON: set to true
// TO DISABLE WHEN READY TO LAUNCH: set to false
const COMING_SOON_MODE = true;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never intercept these — static files, API, auth pages
  const skip = [
    "/_next",
    "/favicon",
    "/api/",
    "/login",
    "/signup",
    "/coming-soon",
  ];
  if (skip.some((s) => pathname.startsWith(s))) {
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createMiddlewareClient({ req: request, res: response });

  let session = null;
  try {
    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch {
    // If session fetch fails, just continue
    return response;
  }

  // ── COMING SOON MODE ──────────────────────────────
  if (COMING_SOON_MODE && pathname !== "/coming-soon") {
    if (session) {
      // Check if admin — admins bypass coming soon
      try {
        const { data: user } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (user?.role === "admin") {
          // Admin — apply normal dashboard protection only
          if (pathname.startsWith("/dashboard") && !session) {
            return NextResponse.redirect(new URL("/login", request.url));
          }
          return response;
        }
      } catch {
        // Can't check role — send to coming soon
      }
    }

    // Not admin or not logged in — redirect to coming soon
    return NextResponse.redirect(new URL("/coming-soon", request.url));
  }

  // ── NORMAL MODE (coming soon off) ─────────────────
  // Protect dashboard — must be logged in
  if (pathname.startsWith("/dashboard") && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Don't let logged-in users go to login/signup
  if ((pathname === "/login" || pathname === "/signup") && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
