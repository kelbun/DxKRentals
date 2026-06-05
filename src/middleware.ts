import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// TO ENABLE COMING SOON: set to true
// TO DISABLE WHEN READY TO LAUNCH: set to false
const COMING_SOON_MODE = true;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always skip these — no middleware interference
  const alwaysSkip = [
    "/_next",
    "/favicon",
    "/api/",
    "/coming-soon",
    "/login",
    "/signup",
  ];
  if (alwaysSkip.some((s) => pathname.startsWith(s))) {
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
    return response;
  }

  // ── COMING SOON MODE ──────────────────────────────
  if (COMING_SOON_MODE) {
    // Check if admin — admins get full access
    if (session) {
      try {
        const { data: user } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (user?.role === "admin") {
          // Admin bypasses coming soon entirely
          // Still protect /dashboard from logged-out users
          return response;
        }
      } catch {
        // Role check failed — treat as non-admin
      }
    }

    // Non-admin or not logged in — send to coming soon
    // (coming soon page itself is in alwaysSkip so no loop)
    return NextResponse.redirect(new URL("/coming-soon", request.url));
  }

  // ── NORMAL MODE (coming soon is off) ──────────────
  if (pathname.startsWith("/dashboard") && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
