import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/lib/admin";
import prisma from "@/app/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Validate productId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID format" },
        { status: 400 }
      );
    }

    // Fetch only approved reviews for the product
    const reviews = await prisma.review.findMany({
      where: {
        productId,
        isApproved: true,
      },
      include: {
        User: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    if (!session?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, rating, comment } = body;

    // Validate input
    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Valid product ID and rating (1-5) are required" },
        { status: 400 }
      );
    }

    // Validate productId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID format" },
        { status: 400 }
      );
    }

    // Sanitize comment
    const sanitizedComment = comment && typeof comment === 'string'
      ? comment.trim().substring(0, 500)
      : null;

    // Check if product exists and is approved
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    if (product.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Product is not available for review" },
        { status: 400 }
      );
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: session.id,
        productId,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 409 } // Use 409 Conflict for duplicate
      );
    }

    // Create the review (pending approval)
    const review = await prisma.review.create({
      data: {
        userId: session.id,
        productId,
        rating,
        comment: sanitizedComment,
        isApproved: false, // Reviews need admin approval
      },
      include: {
        User: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Log the activity
    await prisma.activity.create({
      data: {
        userId: session.id,
        action: "REVIEW_CREATED",
        description: `User ${session.email} created a review for product ${product.name}`,
        metadata: {
          productId,
          reviewId: review.id,
          rating,
        },
      },
    });

    return NextResponse.json({
      message: "Review submitted successfully. It will be visible after approval.",
      review,
    });
  } catch (error) {
    console.error("Failed to create review:", error);

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: "You have already reviewed this product" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
