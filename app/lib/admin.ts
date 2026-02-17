import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "./db";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  console.log('getCurrentUser: Starting user lookup');
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  console.log('getCurrentUser: Kinde user result:', {
    hasUser: !!user,
    userId: user?.id,
    email: user?.email,
    firstName: user?.given_name,
    lastName: user?.family_name
  });

  if (!user) {
    console.log('getCurrentUser: No user from Kinde session');
    return null;
  }

  console.log('getCurrentUser: Looking up user in database with ID:', user.id);
  const dbUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
  });

  console.log('getCurrentUser: Database user result:', {
    found: !!dbUser,
    dbUserId: dbUser?.id,
    dbEmail: dbUser?.email,
    role: dbUser?.role,
    isActive: dbUser?.isActive
  });

  return dbUser;
}

export async function requireAuth() {
  // Skip authentication during build/static generation
  if (process.env.NEXT_PHASE === "phase-production-build" || process.env.NODE_ENV === "development" && process.env.npm_lifecycle_event === "build") {
    throw new Error("Build environment - skipping auth");
  }

  const user = await getCurrentUser();

  if (!user) {
    // Check if we're in an API route by checking the call stack
    const stack = new Error().stack || '';
    if (stack.includes('/api/') || stack.includes('route.ts')) {
      throw new Error("Authentication required");
    }
    redirect("/api/auth/login");
  }

  return user;
}

export async function requireAdmin() {
  try {
    console.log('requireAdmin: Starting authentication check');
    const user = await requireAuth();

    console.log('requireAdmin: User authenticated:', {
      userId: user?.id,
      email: user?.email,
      role: user?.role,
      isActive: user?.isActive
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      console.log('Admin access denied. User role:', user?.role, 'User exists:', !!user);

      // Enhanced debugging
      if (!user) {
        console.log('requireAdmin: No user found in database');
      } else {
        console.log('requireAdmin: User found but role is:', user.role);
      }

      // Check if we're in an API route
      const stack = new Error().stack || '';
      if (stack.includes('/api/') || stack.includes('route.ts')) {
        throw new Error(`Admin access required. Current role: ${user?.role || 'NONE'}`);
      }

      redirect("/unauthorized");
    }

    console.log('requireAdmin: Access granted for user:', user.email);
    return user;
  } catch (error) {
    console.error('Admin authentication error:', error);
    throw error;
  }
}

export async function requireSuperAdmin() {
  const user = await requireAuth();

  if (!user || user.role !== "SUPER_ADMIN") {
    redirect("/unauthorized");
  }

  return user;
}

export function isAdmin(user: any): boolean {
  return user.role === "ADMIN" || user.role === "SUPER_ADMIN";
}

export function isSuperAdmin(user: any): boolean {
  return user.role === "SUPER_ADMIN";
}

export async function logActivity(
  userId: string,
  action: any,
  description: string,
  metadata?: any,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    await prisma.activity.create({
      data: {
        userId,
        action,
        description,
        metadata: metadata || undefined,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
