import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/admin";
import prisma from "@/app/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const { id } = params;
    const body = await request.json();

    // Validate required fields
    const { name, price, smallDescription, category, phoneNumber, location } = body;
    if (!name || !price || !smallDescription || !category) {
      return NextResponse.json(
        { error: "Missing required fields: name, price, smallDescription, category" },
        { status: 400 }
      );
    }

    // Find the category by name
    const categoryRecord = await prisma.category.findUnique({
      where: { name: category },
    });

    if (!categoryRecord) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 }
      );
    }

    // Update the product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        price: parseInt(price),
        smallDescription,
        categoryId: categoryRecord.id,
        phoneNumber: phoneNumber || null,
        location: location || null,
        updatedAt: new Date(),
      },
      include: {
        User: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        Category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log the activity
    await prisma.activity.create({
      data: {
        action: "PRODUCT_UPDATED",
        description: `Product "${updatedProduct.name}" was updated by admin`,
        metadata: {
          productId: updatedProduct.id,
          productName: updatedProduct.name,
          updatedFields: Object.keys(body),
        },
        userId: updatedProduct.userId,
      },
    });

    return NextResponse.json({ product: updatedProduct });
  } catch (error) {
    console.error("Product update error:", error);

    // Handle build environment gracefully
    if (error instanceof Error && error.message.includes("Build environment")) {
      return NextResponse.json({ error: "Build environment detected" }, { status: 503 });
    }

    if (error instanceof Error && error.message.includes("Record to update not found")) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const { id } = params;

    // First get the product details for logging
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        User: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        Category: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Delete related records first (due to foreign key constraints)
    await prisma.productTag.deleteMany({
      where: { productId: id },
    });

    await prisma.review.deleteMany({
      where: { productId: id },
    });

    // Delete the product
    await prisma.product.delete({
      where: { id },
    });

    // Log the activity
    await prisma.activity.create({
      data: {
        action: "PRODUCT_DELETED",
        description: `Product "${product.name}" was deleted by admin`,
        metadata: {
          productId: product.id,
          productName: product.name,
          productCategory: product.Category?.name || 'Unknown',
          productPrice: product.price,
        },
        userId: product.userId,
      },
    });

    return NextResponse.json({
      message: "Product deleted successfully",
      deletedProduct: product
    });
  } catch (error) {
    console.error("Product deletion error:", error);

    // Handle build environment gracefully
    if (error instanceof Error && error.message.includes("Build environment")) {
      return NextResponse.json({ error: "Build environment detected" }, { status: 503 });
    }

    if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
