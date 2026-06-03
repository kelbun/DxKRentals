import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// TO ENABLE COMING SOON: set to true
// TO DISABLE WHEN READY TO LAUNCH: set to false
const COMING_SOON_MODE = true;

const PROTECTED_ROUTES = ["/dashboard"];
const AUTH_ROUTES = ["/login", "/signup"];
const ALWAYS_ALLOWED = ["/coming-soon", "/login", "/signup", "/_next", "/favicon", "/api"];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } });
  const supabase = createMiddlewareClient({ req: request, res: response });
  const { data: { session } } = await supabase.auth.getSession();
  const { pathname } = request.nextUrl;

  // COMING SOON MODE — redirects everyone except admins
  if (COMING_SOON_MODE) {
    const isAllowed = ALWAYS_ALLOWED.some((p) => pathname.startsWith(p));
    if (!isAllowed) {
      if (session) {
        const { data: user } = await supabase
          .from("users").select("role").eq("id", session.user.id).single();
        if (user?.role === "admin") {
          // Admin can access everything normally
          const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
          if (isProtected && !session) return NextResponse.redirect(new URL("/login", request.url));
          return response;
        }
      }
      // Non-admin or logged out — redirect to coming soon
      return NextResponse.redirect(new URL("/coming-soon", request.url));
    }
  }

  // Normal auth protection (when coming soon is off)
  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAuth = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  if (isProtected && !session) return NextResponse.redirect(new URL("/login", request.url));
  if (isAuth && session) return NextResponse.redirect(new URL("/dashboard", request.url));

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
