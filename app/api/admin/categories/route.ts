import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/admin";
import prisma from "@/app/lib/db";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  // Skip authentication during build/static generation
  const isBuildTime = process.env.NEXT_PHASE === "phase-production-build" ||
    (process.env.NODE_ENV === "development" && process.env.npm_lifecycle_event === "build");

  // During build time, return empty data to avoid database connection issues
  if (isBuildTime) {
    return NextResponse.json({ categories: [] });
  }

  try {
    await requireAdmin();

    // Get categories with product counts
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            Product: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const formattedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      icon: cat.icon,
      color: cat.color,
      isActive: cat.isActive,
      count: cat._count.Product,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    }));

    return NextResponse.json({ categories: formattedCategories });
  } catch (error) {
    console.error("Categories API error:", error);

    // Handle specific authentication errors
    if (error instanceof Error) {
      if (error.message.includes("Build environment")) {
        console.log("Build environment detected, returning empty categories");
        return NextResponse.json({ categories: [] });
      }

      if (error.message.includes("Authentication required") || error.message.includes("Admin access required")) {
        console.log("Categories authentication failed:", error.message);
        return NextResponse.json(
          { error: "Authentication required. Please log in as an admin." },
          { status: 401 }
        );
      }
    }

    console.error("Categories API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const { name, description, icon, color } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // Check if category already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name: name.toLowerCase().trim() },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: name.toLowerCase().trim(),
        description: description?.trim() || null,
        icon: icon?.trim() || null,
        color: color || "#3B82F6",
      },
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Create category error:", error);

    // Handle specific authentication errors
    if (error instanceof Error) {
      if (error.message.includes("Authentication required") || error.message.includes("Admin access required")) {
        console.log("Create category authentication failed:", error.message);
        return NextResponse.json(
          { error: "Authentication required. Please log in as an admin." },
          { status: 401 }
        );
      }
    }

    console.error("Create category error:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
