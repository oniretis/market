import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/admin";

export async function GET() {
  try {
    console.log('Auth status: Starting check...');

    // Skip authentication during build/static generation
    const isBuildTime = process.env.NEXT_PHASE === "phase-production-build" ||
      (process.env.NODE_ENV === "development" && process.env.npm_lifecycle_event === "build");

    console.log('Auth status: Build time check:', { isBuildTime, NEXT_PHASE: process.env.NEXT_PHASE, NODE_ENV: process.env.NODE_ENV });

    if (isBuildTime) {
      console.log('Auth status: Returning false for build time');
      return NextResponse.json({ authenticated: false });
    }

    console.log('Auth status: Getting current user...');
    const user = await getCurrentUser();

    console.log('Auth status: User result:', { hasUser: !!user, userId: user?.id });

    // Don't expose sensitive user data in auth status
    const response = {
      authenticated: !!user,
      user: user ? {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName
      } : null
    };

    console.log('Auth status: Returning response:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Auth status check failed:", error);
    return NextResponse.json({ authenticated: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
