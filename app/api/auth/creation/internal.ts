import prisma from "@/app/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
  console.log('Internal user creation: Starting process');
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || user === null || !user.id) {
    console.log('Internal user creation: No user found in Kinde session');
    return NextResponse.json({ error: "No user found" }, { status: 401 });
  }

  console.log('Internal user creation: Looking for user in database:', user.id);
  let dbUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
  });

  if (!dbUser) {
    console.log('Internal user creation: Creating new user for:', user.email);
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        firstName: user.given_name ?? "",
        lastName: user.family_name ?? "",
        email: user.email ?? "",
        profileImage:
          user.picture ?? `https://avatar.vercel.sh/${user.given_name}`,
        // Default role - will need to be manually updated to ADMIN/SUPER_ADMIN
        role: "USER",
      },
    });
    console.log('Internal user creation: Created new user with role USER');
  } else {
    console.log('Internal user creation: User already exists:', {
      email: dbUser.email,
      role: dbUser.role,
      isActive: dbUser.isActive
    });
  }

  return NextResponse.json({
    success: true,
    user: dbUser,
    debug: {
      isNewUser: !dbUser,
      currentRole: dbUser.role,
      isActive: dbUser.isActive
    }
  });
}
