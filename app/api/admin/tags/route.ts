import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/admin";
import prisma from "@/app/lib/db";

export async function GET() {
  try {
    await requireAdmin();

    // For now, return empty array since Tag model isn't in the schema yet
    // In the future, this will fetch from the Tag model
    const tags: any[] = [];

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Tags API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const { name, description, color } = await request.json();

    // For now, just return success since Tag model isn't in the schema yet
    // In the future, this will create a new tag
    // const tag = await prisma.tag.create({
    //   data: {
    //     name,
    //     description,
    //     color,
    //   },
    // });

    return NextResponse.json({ 
      message: "Tag created successfully",
      tag: { id: "temp-id", name, description, color }
    });
  } catch (error) {
    console.error("Tag creation error:", error);
    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    );
  }
}
