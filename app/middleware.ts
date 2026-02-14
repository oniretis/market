import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function middleware(request: NextRequest) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/api/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // For admin routes, we need to check the user's role in the database
    // This is handled by the requireAdmin() function in the layout
    // But we can add a basic check here to prevent unnecessary redirects
    try {
      const response = await fetch(`${request.nextUrl.origin}/api/auth/creation/internal`, {
        method: "POST",
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      });

      if (!response.ok) {
        console.error("User verification failed in middleware:", await response.text());
        // Don't block the request, let the layout handle it
      }
    } catch (error) {
      console.error("Middleware user verification error:", error);
      // Don't block the request, let the layout handle it
    }
  }

  // Create user in local database if they exist in Kinde but not in our DB
  if (user && user.id) {
    try {
      // Call the internal creation API to ensure user exists in local database
      const response = await fetch(`${request.nextUrl.origin}/api/auth/creation/internal`, {
        method: "POST",
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      });

      if (!response.ok) {
        console.error("User creation failed:", await response.text());
      }
    } catch (error) {
      // Log error but don't block the request
      console.error("Middleware user creation error:", error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
