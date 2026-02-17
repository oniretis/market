import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/admin";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET() {
  try {
    console.log('Auth test: Starting comprehensive authentication test');

    // Test 1: Check Kinde session directly
    const { getUser, getPermissions } = getKindeServerSession();
    const kindeUser = await getUser();
    const permissions = await getPermissions();

    console.log('Auth test: Kinde session check:', {
      hasKindeUser: !!kindeUser,
      kindeUserId: kindeUser?.id,
      kindeEmail: kindeUser?.email,
      permissions: permissions
    });

    // Test 2: Check database user lookup
    const dbUser = await getCurrentUser();

    if (!dbUser) {
      console.log('Auth test: No user found in database');
      return NextResponse.json({
        success: false,
        error: "User not found in database",
        details: {
          kindeSession: !!kindeUser,
          kindeEmail: kindeUser?.email,
          kindeId: kindeUser?.id,
          databaseUser: null
        },
        fix: "User may not be properly synced from Kinde to database"
      });
    }

    console.log('Auth test: Database user found:', dbUser.email);

    // Test 3: Check admin role
    const isAdmin = dbUser.role === "ADMIN" || dbUser.role === "SUPER_ADMIN";

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        role: dbUser.role,
        isActive: dbUser.isActive
      },
      authorization: {
        isAdmin,
        isSuperAdmin: dbUser.role === "SUPER_ADMIN",
        canAccessAdmin: isAdmin
      },
      session: {
        kindeActive: !!kindeUser,
        databaseSync: kindeUser?.id === dbUser.id,
        userActive: dbUser.isActive
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        phase: process.env.NEXT_PHASE
      }
    });

  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDbUrl: !!process.env.DATABASE_URL,
        phase: process.env.NEXT_PHASE
      }
    }, { status: 500 });
  }
}
