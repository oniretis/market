import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "./db";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
  });

  return dbUser;
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/api/auth/login");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    redirect("/unauthorized");
  }

  return user;
}

export async function requireSuperAdmin() {
  const user = await requireAuth();

  if (user.role !== "SUPER_ADMIN") {
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
