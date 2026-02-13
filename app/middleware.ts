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
      return NextResponse.redirect(new URL("/api/auth/login", request.url));
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
