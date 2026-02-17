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
      console.log('Middleware: No user found, redirecting to login');
      const loginUrl = new URL("/api/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    console.log('Middleware: User found in Kinde session:', user.email);

    // Temporarily disable user creation calls to debug auth issues
    // The admin layout will handle role verification
    console.log('Middleware: Skipping user creation, letting layout handle auth');
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
