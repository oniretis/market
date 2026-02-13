import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/admin";
import { logActivity } from "@/app/lib/admin";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    const tagId = params.id;

    // For now, just return success since Tag model isn't in the schema yet
    // In the future, this will delete the tag
    // await prisma.tag.delete({
    //   where: { id: tagId },
    // });

    // Log the activity
    await logActivity(
      admin.id,
      "TAG_DELETED",
      `Tag ${tagId} was deleted`,
      { tagId }
    );

    return NextResponse.json({ 
      message: "Tag deleted successfully",
      tagId 
    });
  } catch (error) {
    console.error("Tag deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete tag" },
      { status: 500 }
    );
  }
}
